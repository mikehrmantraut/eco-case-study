import { Client } from '@stomp/stompjs';
import axios from 'axios';

class RabbitMQService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.errorHandlers = [];
    this.queueName = 'eco.messages';
    this.reconnectTimer = null;
    
    // RabbitMQ Web STOMP settings
    this.host = '192.168.1.22';
    this.port = 15674;
    this.username = 'admin';
    this.password = 'admin123';
    this.vhost = '/';
  }

  // Add message handler
  onMessage(callback) {
    this.messageHandlers.push(callback);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(handler => handler !== callback);
    };
  }

  // Add connection status handler
  onConnectionChange(callback) {
    this.connectionHandlers.push(callback);
    // If we already have a connection status, notify immediately
    if (this.connected) {
      setTimeout(() => callback(true), 0);
    }
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(handler => handler !== callback);
    };
  }

  // Add error handler
  onError(callback) {
    this.errorHandlers.push(callback);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(handler => handler !== callback);
    };
  }

  // Connect to RabbitMQ
  connect() {
    if (this.client) {
      this.disconnect();
    }

    try {
      console.log('Creating STOMP client...');
      
      // Use global WebSocket for React Native environment
      const webSocketFactory = () => {
        console.log(`Creating WebSocket to ws://${this.host}:${this.port}/ws`);
        return new global.WebSocket(`ws://${this.host}:${this.port}/ws`);
      };
      
      // Create STOMP client with WebSocket factory
      this.client = new Client({
        // Use WebSocket factory instead of direct brokerURL
        webSocketFactory: webSocketFactory,
        connectHeaders: {
          login: this.username,
          passcode: this.password,
          host: this.vhost
        },
        debug: msg => console.log('STOMP: ' + msg),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,     // Increased heartbeat time
        heartbeatOutgoing: 10000,     // Increased heartbeat time
        maxWebSocketFrameSize: 16 * 1024,  // Increased frame size
      });

      // Set up connection event handlers
      this.client.onConnect = this._handleConnect.bind(this);
      this.client.onStompError = this._handleError.bind(this);
      this.client.onWebSocketClose = this._handleDisconnect.bind(this);
      this.client.onWebSocketError = (error) => {
        console.log('WebSocket Error:', error);
        this._notifyError(new Error('WebSocket error: ' + error.toString()));
      };

      console.log('Activating STOMP client...');
      
      // Activate the client
      this.client.activate();
    } catch (error) {
      console.log('Connection error:', error);
      this._notifyError(error);
    }
  }

  // Disconnect from RabbitMQ
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.client) {
      try {
        if (this.client.connected) {
          this.client.deactivate();
        }
      } catch (error) {
        console.log('Error during disconnect:', error);
      }
      this._notifyConnectionChange(false);
    }
    this.client = null;
    this.connected = false;
  }

  // Check if connected
  isConnected() {
    const connected = this.connected && this.client && this.client.connected;
    console.log(`Connection status check: ${connected ? 'Connected' : 'Disconnected'}`);
    return connected;
  }
  
  // Check connection and attempt reconnect if needed
  checkConnection() {
    console.log('Checking connection status...');
    if (!this.isConnected()) {
      console.log('Connection check failed, attempting to reconnect...');
      this.connect();
      return false;
    }
    return true;
  }

  // Fetch messages directly via Management API
  async fetchMessages(limit = 10) {
    try {
      console.log(`Fetching messages from http://${this.host}:15672/api/queues/%2F/${this.queueName}/get`);
      
      // Use POST request with proper body format
      const response = await axios({
        method: 'post',
        url: `http://${this.host}:15672/api/queues/%2F/${this.queueName}/get`,
        auth: {
          username: this.username,
          password: this.password
        },
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          count: limit,
          encoding: 'auto',
          ackmode: 'ack_requeue_true'
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('Fetch response status:', response.status);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} messages`);
        return response.data.map(msg => {
          try {
            return JSON.parse(msg.payload);
          } catch (e) {
            console.log('Parse error for message:', msg.payload);
            return { content: msg.payload, error: 'Parse error' };
          }
        });
      }
      console.log('No messages received or invalid response format');
      return [];
    } catch (error) {
      console.log('Fetch error details:', error.message);
      if (error.response) {
        console.log('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.log('No response received from server');
      }
      this._notifyError(error);
      return [];
    }
  }

  // Private: Handle successful connection
  _handleConnect(frame) {
    console.log('Connected to RabbitMQ:', frame);
    
    try {
      // Subscribe to the exchange with the routing key instead of directly to the queue
      // This avoids the precondition_failed error
      console.log('Subscribing to exchange with topic');
      this.subscription = this.client.subscribe('/exchange/eco.exchange/eco.message.route', message => {
        try {
          console.log('Received message:', message.body);
          const messageData = JSON.parse(message.body);
          
          // Process the message immediately - this will trigger auto-refresh
          this._notifyMessageReceived(messageData);
        } catch (error) {
          console.log('Failed to parse message:', error);
          this._notifyError(new Error('Failed to parse message: ' + error.message));
        }
      }, {
        // Add auto-acknowledgment to ensure messages are processed
        ack: 'auto'
      });
      
      console.log('Subscription created with auto-refresh:', this.subscription);
      this.connected = true;
      this._notifyConnectionChange(true);
    } catch (error) {
      console.log('Error during subscription:', error);
      this._notifyError(error);
      this.connected = false;
      this._notifyConnectionChange(false);
    }
  }

  // Private: Handle connection error
  _handleError(frame) {
    console.log('STOMP error frame:', frame);
    this._notifyError(new Error('STOMP error: ' + (frame.headers?.message || 'Unknown error')));
    this.connected = false;
    this._notifyConnectionChange(false);
  }

  // Private: Handle disconnection
  _handleDisconnect() {
    console.log('WebSocket disconnected');
    
    // Only notify if we were previously connected
    if (this.connected) {
      this.connected = false;
      this._notifyConnectionChange(false);
    }
    
    // Try to reconnect after a delay
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        if (!this.client?.connected) {
          console.log('Attempting to reconnect...');
          this.connect();
        }
      }, 8000); // Increased reconnect delay
    }
  }

  // Private: Notify all message handlers
  _notifyMessageReceived(message) {
    console.log('Notifying message handlers about new message:', message);
    // Process the message immediately
    this.messageHandlers.forEach(handler => {
      try {
        // Call the handler with the new message
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  // Private: Notify all connection handlers
  _notifyConnectionChange(connected) {
    console.log('Connection status changed:', connected);
    this.connected = connected;
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  // Private: Notify all error handlers
  _notifyError(error) {
    console.error('RabbitMQ Error:', error);
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }
}

// Create a singleton instance
const rabbitMQService = new RabbitMQService();
export default rabbitMQService;
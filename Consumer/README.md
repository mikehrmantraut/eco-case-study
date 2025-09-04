# ECO Consumer App

React Native mobile application that consumes messages from RabbitMQ.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- RabbitMQ server running (via Docker)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure RabbitMQ is running with Web STOMP plugin enabled:
   ```
   docker-compose up -d
   docker exec eco-rabbitmq rabbitmq-plugins enable rabbitmq_web_stomp
   docker restart eco-rabbitmq
   ```

3. Update the IP address in `services/RabbitMQService.js` to match your computer's IP address (not localhost or 127.0.0.1):
   ```javascript
   this.rabbitMQUrl = 'http://YOUR_IP_ADDRESS:15674/ws';
   ```

4. Start the Expo development server:
   ```
   npm start
   ```

5. Run on Android emulator:
   ```
   npm run android
   ```
   
   Or on iOS simulator (requires macOS):
   ```
   npm run ios
   ```

## How it Works

1. The app connects to RabbitMQ using STOMP over WebSockets on port 15674
2. It subscribes to the `eco.messages` queue
3. Messages are displayed in real-time as they arrive
4. You can also manually refresh to fetch recent messages

## Configuration

- RabbitMQ connection settings are in `services/RabbitMQService.js`
- By default, it connects to your local IP address on port 15674
- For Android emulator, you might need to use `10.0.2.2` instead of your IP address

## Troubleshooting

- Make sure RabbitMQ is running and accessible
- Verify that the Web STOMP plugin is enabled (`rabbitmq_web_stomp`)
- Check that port 15674 is exposed in docker-compose.yml
- Verify the credentials (default: admin/admin123)
- For physical devices, ensure they can reach your development machine's IP
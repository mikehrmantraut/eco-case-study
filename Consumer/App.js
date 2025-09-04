import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MessageList from './components/MessageList';
import rabbitMQService from './services/RabbitMQService';
import { colors, spacing, typography, shadows } from './theme';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessageReceived, setNewMessageReceived] = useState(false);

  // Connect to RabbitMQ when component mounts
  useEffect(() => {
    // Handle incoming messages with auto-refresh
    const unsubscribeMessages = rabbitMQService.onMessage((message) => {
      console.log("New message received, auto-refreshing list");
      // Add the new message to the existing list
      setMessages((prevMessages) => [message, ...prevMessages]);
      // Show new message notification
      setNewMessageReceived(true);
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNewMessageReceived(false);
      }, 3000);
    });

    // Connect to RabbitMQ
    connectToRabbitMQ();

    // Initial message fetch
    fetchMessages();
    
    // Periodic connection check (every 30 seconds)
    const connectionCheckInterval = setInterval(() => {
      console.log("Performing periodic connection check");
      if (!rabbitMQService.isConnected()) {
        rabbitMQService.checkConnection();
      }
    }, 30000);

    // Cleanup on unmount
    return () => {
      unsubscribeMessages();
      clearInterval(connectionCheckInterval);
      rabbitMQService.disconnect();
    };
  }, []);

  // Connect to RabbitMQ
  const connectToRabbitMQ = () => {
    try {
      rabbitMQService.connect();
    } catch (err) {
      console.log('Connection error:', err);
    }
  };

  // Fetch messages from RabbitMQ
  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      // Check connection before fetching messages
      rabbitMQService.checkConnection();
      
      const fetchedMessages = await rabbitMQService.fetchMessages(100);
      if (fetchedMessages && fetchedMessages.length > 0) {
        setMessages(fetchedMessages);
      }
    } catch (err) {
      console.log('Error fetching messages:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMessages();
  };

  // Auto reconnect is handled by the service

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.secondary} />
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Bot</Text>
              <Text style={[styles.logoText, styles.logoTextHighlight]}>Bot</Text>
            </View>
            <Text style={styles.subtitle}>Message Consumer</Text>
          </View>

          {/* New message notification */}
          {newMessageReceived && (
            <View style={styles.notification}>
              <Text style={styles.notificationText}>Yeni mesaj alındı!</Text>
            </View>
          )}

          <MessageList 
            messages={messages} 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
          />
          
          {/* Bottom padding for iOS and Android */}
          <View style={styles.bottomPadding} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomPadding: {
    height: Platform.OS === 'ios' ? spacing.xl : spacing.xl * 2,
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: colors.secondary,
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    ...shadows.small,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  logoText: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  logoTextHighlight: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.small,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  notification: {
    backgroundColor: colors.success,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  notificationText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: typography.fontSize.medium,
  },
});
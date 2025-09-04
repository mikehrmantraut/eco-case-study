import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MessageList from './components/MessageList';
import ConnectionStatus from './components/ConnectionStatus';
import rabbitMQService from './services/RabbitMQService';
import { colors, spacing, typography, borderRadius, shadows } from './theme';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Connect to RabbitMQ when component mounts
  useEffect(() => {
    // Handle connection status changes
    const unsubscribeConnection = rabbitMQService.onConnectionChange((isConnected) => {
      setConnected(isConnected);
      if (isConnected) {
        setError(null);
      }
    });

    // Handle incoming messages
    const unsubscribeMessages = rabbitMQService.onMessage((message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    // Handle errors
    const unsubscribeErrors = rabbitMQService.onError((err) => {
      setError(err);
    });

    // Connect to RabbitMQ
    connectToRabbitMQ();

    // Initial message fetch
    fetchMessages();

    // Cleanup on unmount
    return () => {
      unsubscribeConnection();
      unsubscribeMessages();
      unsubscribeErrors();
      rabbitMQService.disconnect();
    };
  }, []);

  // Connect to RabbitMQ
  const connectToRabbitMQ = () => {
    try {
      rabbitMQService.connect();
    } catch (err) {
      setError(err);
    }
  };

  // Fetch messages from RabbitMQ
  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      const fetchedMessages = await rabbitMQService.fetchMessages(20);
      if (fetchedMessages && fetchedMessages.length > 0) {
        setMessages(fetchedMessages);
      }
    } catch (err) {
      setError(err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMessages();
  };

  // Handle reconnect
  const handleReconnect = () => {
    setError(null);
    connectToRabbitMQ();
  };

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

          <ConnectionStatus connected={connected} error={error} />
          
          {!connected && (
            <TouchableOpacity style={styles.reconnectButton} onPress={handleReconnect}>
              <Text style={styles.reconnectText}>Reconnect</Text>
            </TouchableOpacity>
          )}

          <MessageList 
            messages={messages} 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
          />
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
  reconnectButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    margin: spacing.sm,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    ...shadows.small,
  },
  reconnectText: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.medium,
  },
});
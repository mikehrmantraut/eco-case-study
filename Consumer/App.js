import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MessageList from './components/MessageList';
import MessageStats from './components/MessageStats';
import MessageFilter from './components/MessageFilter';
import rabbitMQService from './services/RabbitMQService';
import { colors, spacing, typography, shadows, borderRadius } from './theme';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessageReceived, setNewMessageReceived] = useState(false);
  const [messageStats, setMessageStats] = useState({
    info: 0,
    warning: 0,
    success: 0,
    alert: 0,
    total: 0
  });
  const [activeFilters, setActiveFilters] = useState({
    searchText: '',
    messageTypes: {
      info: true,
      warning: true,
      success: true,
      alert: true
    }
  });

  // Calculate message statistics
  const calculateMessageStats = (messageList) => {
    const stats = {
      info: 0,
      warning: 0,
      success: 0,
      alert: 0,
      total: messageList.length
    };
    
    messageList.forEach(msg => {
      const type = msg.MessageType?.toLowerCase() || 'info';
      if (type === 'info') stats.info++;
      else if (type === 'warning') stats.warning++;
      else if (type === 'success') stats.success++;
      else if (type === 'alert') stats.alert++;
    });
    
    return stats;
  };

  // Connect to RabbitMQ when component mounts
  useEffect(() => {

    // Handle incoming messages with auto-refresh
    const unsubscribeMessages = rabbitMQService.onMessage((message) => {
      console.log("New message received, auto-refreshing list");
      // Add the new message to the existing list
      setMessages((prevMessages) => {
        const updatedMessages = [message, ...prevMessages];
        // Message statistics will be updated in the useEffect that handles filtering
        return updatedMessages;
      });
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
    
    // Periodic connection check (every 60 seconds)
    const connectionCheckInterval = setInterval(() => {
      // Reduce connection check frequency and logging
      if (!rabbitMQService.isConnected()) {
        console.log("Connection check: disconnected, attempting reconnect");
        rabbitMQService.checkConnection();
      }
    }, 60000);

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

  // Apply filters to messages
  const applyFilters = useCallback((messageList) => {
    if (!messageList) return [];
    
    return messageList.filter(msg => {
      // Filter by message type
      const messageType = msg.MessageType?.toLowerCase() || 'info';
      if (!activeFilters.messageTypes[messageType]) {
        return false;
      }
      
      // Filter by search text
      if (activeFilters.searchText) {
        const searchLower = activeFilters.searchText.toLowerCase();
        const contentLower = (msg.Content || '').toLowerCase();
        const senderLower = (msg.Sender || '').toLowerCase();
        
        return contentLower.includes(searchLower) || senderLower.includes(searchLower);
      }
      
      return true;
    });
  }, [activeFilters]);

  // Update filtered messages and their stats when messages or filters change
  useEffect(() => {
    const filtered = applyFilters(messages);
    setFilteredMessages(filtered);
    
    // Calculate stats for filtered messages
    const filteredStats = calculateMessageStats(filtered);
    setMessageStats(filteredStats);
  }, [messages, activeFilters, applyFilters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  // Fetch messages from RabbitMQ
  const fetchMessages = async () => {
    setRefreshing(true);
    try {
      // Check connection before fetching messages
      rabbitMQService.checkConnection();
      
      const fetchedMessages = await rabbitMQService.fetchMessages(100);
      if (fetchedMessages && fetchedMessages.length > 0) {
        // Sırala: Yeni mesajlar üstte, eski mesajlar altta
        const sortedMessages = [...fetchedMessages].sort((a, b) => {
          // Timestamp'e göre sıralama, yeni mesajlar üstte
          const timeA = new Date(a.Timestamp || 0).getTime();
          const timeB = new Date(b.Timestamp || 0).getTime();
          return timeB - timeA; // Azalan sıralama (yeni -> eski)
        });
        
        setMessages(sortedMessages);
        // Message statistics will be updated in the useEffect that handles filtering
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

          {/* Dashboard */}
          <View style={styles.dashboardContainer}>
            {/* Message statistics */}
            <MessageStats stats={messageStats} />
            
            {/* Message filters */}
            <MessageFilter onFilterChange={handleFilterChange} />
          </View>

          {/* Message list */}
          <View style={styles.messageListContainer}>
            <View style={styles.messageHeaderContainer}>
              <Text style={styles.sectionTitle}>Mesajlar</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleRefresh}
                activeOpacity={0.7}
              >
                <Text style={styles.refreshButtonText}>Yenile</Text>
              </TouchableOpacity>
            </View>
            <MessageList 
              messages={filteredMessages} 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
            />
          </View>
          
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
  dashboardContainer: {
    backgroundColor: colors.background,
  },
  messageListContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  sectionTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  refreshButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
    ...shadows.small,
  },
  refreshButtonText: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.small,
  },
});
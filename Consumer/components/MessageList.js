import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native';
import MessageItem from './MessageItem';
import { colors, spacing, typography } from '../theme';

const MessageList = ({ messages, refreshing, onRefresh }) => {
  const [messageList, setMessageList] = useState(messages);

  // Handle message deletion
  const handleDeleteMessage = (messageId) => {
    setMessageList((currentMessages) => 
      currentMessages.filter((msg) => msg.Id !== messageId)
    );
  };

  // Update message list when props change
  React.useEffect(() => {
    setMessageList(messages);
  }, [messages]);

  // Custom refresh control with theme colors
  const renderRefreshControl = () => (
    <RefreshControl 
      refreshing={refreshing} 
      onRefresh={onRefresh}
      colors={[colors.primary]} 
      tintColor={colors.primary}
      progressBackgroundColor={colors.secondaryLight}
    />
  );

  if (!messageList || messageList.length === 0) {
    return (
      <ScrollView 
        contentContainerStyle={styles.emptyContainer}
        refreshControl={renderRefreshControl()}
      >
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>Pull down to refresh</Text>
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={messageList}
      keyExtractor={(item) => item.Id || String(Math.random())}
      renderItem={({ item }) => (
        <MessageItem 
          message={item} 
          onDelete={() => handleDeleteMessage(item.Id)} 
        />
      )}
      contentContainerStyle={styles.listContent}
      refreshControl={renderRefreshControl()}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: '100%',
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: typography.fontSize.large,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.medium,
    color: colors.textLight,
  },
});

export default MessageList;
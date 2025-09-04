import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

const MessageItem = ({ message, onDelete }) => {
  // Determine message style based on message type
  const getMessageStyle = () => {
    switch (message.MessageType) {
      case 'Warning':
        return styles.warningMessage;
      case 'Success':
        return styles.successMessage;
      case 'Alert':
        return styles.alertMessage;
      case 'Info':
      default:
        return styles.infoMessage;
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Render right actions (delete button)
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActionContainer}>
        <Animated.View style={[styles.rightAction, { transform: [{ translateX: trans }] }]}>
          <RectButton style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.actionText}>Delete</Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} friction={2} rightThreshold={40}>
      <View style={[styles.messageContainer, getMessageStyle(), shadows.small]}>
        <View style={styles.header}>
          <Text style={styles.messageType}>{message.MessageType}</Text>
          <Text style={styles.timestamp}>{formatTime(message.Timestamp)}</Text>
        </View>
        <Text style={styles.content}>{message.Content}</Text>
        <Text style={styles.sender}>From: {message.Sender}</Text>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.secondary,
  },
  infoMessage: {
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  warningMessage: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  successMessage: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  alertMessage: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  messageType: {
    fontWeight: 'bold',
    fontSize: typography.fontSize.small,
    color: colors.primary,
  },
  timestamp: {
    fontSize: typography.fontSize.small,
    color: colors.textLight,
  },
  content: {
    fontSize: typography.fontSize.medium,
    marginBottom: spacing.xs,
    color: colors.textDark,
  },
  sender: {
    fontSize: typography.fontSize.small,
    color: colors.textLight,
    textAlign: 'right',
  },
  rightActionContainer: {
    width: 80,
    marginVertical: spacing.xs,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderRadius: borderRadius.medium,
  },
  actionText: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.medium,
  },
});

export default MessageItem;
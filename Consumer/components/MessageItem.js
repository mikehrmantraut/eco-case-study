import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

const MessageItem = ({ message, onDelete }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const swipeableRef = useRef(null);
  
  // Run animation when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim]);

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
  
  // Handle message press - expand/collapse
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
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
    <Swipeable 
      ref={swipeableRef}
      renderRightActions={renderRightActions} 
      friction={2} 
      rightThreshold={40}
    >
      <Animated.View 
        style={[
          styles.messageContainer, 
          getMessageStyle(), 
          shadows.small,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={toggleExpanded}
          style={styles.messageContent}
        >
          <View style={styles.header}>
            <Text style={styles.messageType}>{message.MessageType}</Text>
            <Text style={styles.timestamp}>{formatTime(message.Timestamp)}</Text>
          </View>
          
          <Text 
            style={[
              styles.content, 
              expanded ? styles.expandedContent : styles.collapsedContent
            ]}
            numberOfLines={expanded ? undefined : 2}
          >
            {message.Content}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.sender}>From: {message.Sender}</Text>
            <Text style={styles.expandIndicator}>
              {expanded ? '▲ Daralt' : '▼ Genişlet'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
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
  messageContent: {
    width: '100%',
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
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  collapsedContent: {
    lineHeight: 20,
  },
  expandedContent: {
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sender: {
    fontSize: typography.fontSize.small,
    color: colors.textLight,
  },
  expandIndicator: {
    fontSize: typography.fontSize.small,
    color: colors.primary,
    fontWeight: 'bold',
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
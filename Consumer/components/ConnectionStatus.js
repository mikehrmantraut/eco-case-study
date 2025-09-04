import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

const ConnectionStatus = ({ connected, error }) => {
  return (
    <View style={[
      styles.container, 
      connected ? styles.connected : styles.disconnected
    ]}>
      <Text style={styles.statusText}>
        {connected ? 'Connected to RabbitMQ' : 'Disconnected from RabbitMQ'}
      </Text>
      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.small,
  },
  connected: {
    backgroundColor: colors.success,
  },
  disconnected: {
    backgroundColor: colors.error,
  },
  statusText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  errorText: {
    color: colors.textOnPrimary,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 12,
  },
});

export default ConnectionStatus;
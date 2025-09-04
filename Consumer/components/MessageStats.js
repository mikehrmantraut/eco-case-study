import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const MessageStats = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesaj İstatistikleri</Text>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, styles.infoStat]}>
          <Text style={styles.statValue}>{stats.info}</Text>
          <Text style={styles.statLabel}>Bilgi</Text>
        </View>
        
        <View style={[styles.statItem, styles.warningStat]}>
          <Text style={styles.statValue}>{stats.warning}</Text>
          <Text style={styles.statLabel}>Uyarı</Text>
        </View>
        
        <View style={[styles.statItem, styles.successStat]}>
          <Text style={styles.statValue}>{stats.success}</Text>
          <Text style={styles.statLabel}>Başarı</Text>
        </View>
        
        <View style={[styles.statItem, styles.alertStat]}>
          <Text style={styles.statValue}>{stats.alert}</Text>
          <Text style={styles.statLabel}>Alarm</Text>
        </View>
      </View>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Toplam Mesaj:</Text>
        <Text style={styles.totalValue}>{stats.total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    margin: spacing.sm,
    ...shadows.small,
  },
  title: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.xs,
    margin: spacing.xs,
    borderRadius: borderRadius.small,
  },
  infoStat: {
    backgroundColor: colors.info + '20', // %20 opacity
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  warningStat: {
    backgroundColor: colors.warning + '20', // %20 opacity
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  successStat: {
    backgroundColor: colors.success + '20', // %20 opacity
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  alertStat: {
    backgroundColor: colors.error + '20', // %20 opacity
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  statValue: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  statLabel: {
    fontSize: typography.fontSize.small,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: typography.fontSize.medium,
    color: colors.textDark,
  },
  totalValue: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default MessageStats;

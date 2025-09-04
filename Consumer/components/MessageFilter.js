import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const MessageFilter = ({ onFilterChange }) => {
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    info: true,
    warning: true,
    success: true,
    alert: true
  });

  // Handle filter button press
  const toggleFilter = (filterType) => {
    const updatedFilters = {
      ...activeFilters,
      [filterType]: !activeFilters[filterType]
    };
    
    setActiveFilters(updatedFilters);
    
    // Notify parent component about filter changes
    onFilterChange({
      searchText,
      messageTypes: updatedFilters
    });
  };

  // Handle search text change
  const handleSearchChange = (text) => {
    setSearchText(text);
    
    // Notify parent component about filter changes
    onFilterChange({
      searchText: text,
      messageTypes: activeFilters
    });
  };

  // Get button style based on active state
  const getButtonStyle = (type) => {
    return activeFilters[type] ? styles[`${type}Button`] : styles.inactiveButton;
  };

  // Get button text style based on active state
  const getButtonTextStyle = (type) => {
    return activeFilters[type] ? styles.activeButtonText : styles.inactiveButtonText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Mesaj içeriğinde ara..."
          placeholderTextColor={colors.textLight}
          value={searchText}
          onChangeText={handleSearchChange}
        />
      </View>
      
      <Text style={styles.filterTitle}>Mesaj Türleri</Text>
      
      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[styles.filterButton, getButtonStyle('info')]}
          onPress={() => toggleFilter('info')}
        >
          <Text style={getButtonTextStyle('info')}>Bilgi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, getButtonStyle('warning')]}
          onPress={() => toggleFilter('warning')}
        >
          <Text style={getButtonTextStyle('warning')}>Uyarı</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, getButtonStyle('success')]}
          onPress={() => toggleFilter('success')}
        >
          <Text style={getButtonTextStyle('success')}>Başarı</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, getButtonStyle('alert')]}
          onPress={() => toggleFilter('alert')}
        >
          <Text style={getButtonTextStyle('alert')}>Alarm</Text>
        </TouchableOpacity>
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
  searchContainer: {
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.small,
    padding: spacing.sm,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTitle: {
    fontSize: typography.fontSize.small,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  infoButton: {
    backgroundColor: colors.info,
  },
  warningButton: {
    backgroundColor: colors.warning,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  alertButton: {
    backgroundColor: colors.error,
  },
  inactiveButton: {
    backgroundColor: colors.secondaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeButtonText: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.small,
  },
  inactiveButtonText: {
    color: colors.textLight,
    fontSize: typography.fontSize.small,
  },
});

export default MessageFilter;

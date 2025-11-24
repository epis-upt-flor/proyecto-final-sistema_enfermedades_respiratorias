import React from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { RespiCareColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ModernInputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  containerStyle?: ViewStyle;
}

export function ModernInput({
  label,
  icon,
  error,
  containerStyle,
  style,
  ...props
}: ModernInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark
                ? 'rgba(30, 41, 59, 0.5)'
                : 'rgba(255, 255, 255, 0.5)',
              color: isDark ? '#f8fafc' : RespiCareColors.textPrimary,
              paddingLeft: icon ? 48 : 16,
              borderColor: isDark ? RespiCareColors.borderDark : RespiCareColors.border,
            },
            style,
          ]}
          placeholderTextColor={isDark ? RespiCareColors.textTertiary : RespiCareColors.textSecondary}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    height: 56,
    borderRadius: 24,
    fontSize: 16,
    paddingRight: 16,
    paddingVertical: 16,
    borderWidth: 1,
  },
  errorText: {
    color: RespiCareColors.error,
    fontSize: 12,
    marginTop: 4,
  },
});


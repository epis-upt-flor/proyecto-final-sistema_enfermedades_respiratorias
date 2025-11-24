import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { RespiCareColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
}

export function ModernCard({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 16,
}: ModernCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 24,
      padding,
      overflow: 'hidden',
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: isDark
            ? 'rgba(30, 41, 59, 0.6)'
            : 'rgba(255, 255, 255, 0.6)',
          borderWidth: 1,
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.5)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
        };
      case 'gradient':
        return {
          ...baseStyle,
          backgroundColor: isDark
            ? RespiCareColors.dark.backgroundSecondary
            : 'rgba(20, 184, 166, 0.1)',
          borderWidth: 1,
          borderColor: isDark
            ? 'rgba(20, 184, 166, 0.2)'
            : 'rgba(20, 184, 166, 0.1)',
          shadowColor: RespiCareColors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: isDark
            ? RespiCareColors.dark.card
            : RespiCareColors.light.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        };
    }
  };

  const content = (
    <View style={[getCardStyle(), style]}>
      {variant === 'glass' && (
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={{ zIndex: 1 }}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}


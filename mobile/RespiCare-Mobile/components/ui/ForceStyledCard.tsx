import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { RespiCareColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ForceStyledCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Card que FUERZA los estilos modernos, ignorando cualquier estilo de Paper
 */
export function ForceStyledCard({ children, onPress, style }: ForceStyledCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardStyle: ViewStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    ...style,
  };

  const content = <View style={cardStyle}>{children}</View>;

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}


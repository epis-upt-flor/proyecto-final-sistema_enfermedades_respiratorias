import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { RespiCareColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ModernButtonProps {
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'icon' | 'glass';
  size?: 'default' | 'sm' | 'icon' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ModernButton({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  disabled = false,
  icon,
  children,
  style,
  textStyle,
}: ModernButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 24,
      overflow: 'hidden',
      opacity: disabled ? 0.5 : 1,
    };

    switch (size) {
      case 'sm':
        baseStyle.paddingVertical = 10;
        baseStyle.paddingHorizontal = 20;
        baseStyle.height = 40;
        break;
      case 'icon':
        baseStyle.width = 48;
        baseStyle.height = 48;
        baseStyle.paddingVertical = 0;
        baseStyle.paddingHorizontal = 0;
        break;
      case 'lg':
        baseStyle.paddingVertical = 18;
        baseStyle.paddingHorizontal = 32;
        baseStyle.height = 56;
        break;
      default:
        baseStyle.paddingVertical = 14;
        baseStyle.paddingHorizontal = 24;
        baseStyle.height = 48;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    switch (size) {
      case 'sm':
        baseStyle.fontSize = 14;
        break;
      case 'lg':
        baseStyle.fontSize = 18;
        break;
      default:
        baseStyle.fontSize = 16;
    }

    return baseStyle;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'destructive':
        return '#ffffff';
      case 'secondary':
        return isDark ? '#f8fafc' : RespiCareColors.primaryDark;
      case 'outline':
        return RespiCareColors.primary;
      case 'ghost':
        return isDark ? '#f8fafc' : RespiCareColors.textPrimary;
      default:
        return '#ffffff';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={getTextColor()} />;
    }
    
    if (variant === 'icon' || size === 'icon') {
      return icon || children;
    }
    
    return (
      <>
        {icon && <View style={{ marginRight: title || children ? 8 : 0 }}>{icon}</View>}
        {title && <Text style={[getTextStyle(), { color: getTextColor() }, textStyle]}>{title}</Text>}
        {children && <Text style={[getTextStyle(), { color: getTextColor() }, textStyle]}>{children}</Text>}
      </>
    );
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[
          getButtonStyle(),
          {
            backgroundColor: RespiCareColors.primary,
            shadowColor: RespiCareColors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          },
          style,
        ]}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[
          getButtonStyle(),
          {
            backgroundColor: isDark ? RespiCareColors.dark.backgroundSecondary : RespiCareColors.secondary,
          },
          style,
        ]}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[getButtonStyle(), style]}
        activeOpacity={0.6}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[
          getButtonStyle(),
          {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: RespiCareColors.primary,
          },
          style,
        ]}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'destructive') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[
          getButtonStyle(),
          {
            backgroundColor: RespiCareColors.error,
            shadowColor: RespiCareColors.error,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          },
          style,
        ]}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[
          getButtonStyle(),
          {
            borderRadius: 24,
            backgroundColor: 'transparent',
          },
          style,
        ]}
        activeOpacity={0.6}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'glass') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[
          getButtonStyle(),
          {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          },
          style,
        ]}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  return null;
}


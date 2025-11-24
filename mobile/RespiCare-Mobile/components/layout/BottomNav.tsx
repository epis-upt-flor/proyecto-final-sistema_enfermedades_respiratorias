import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { RespiCareColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ViewState = 'dashboard' | 'chat' | 'wearables' | 'history' | 'profile';

interface BottomNavProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
}

export function BottomNav({ currentView, setCurrentView }: BottomNavProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const navItems = [
    { id: 'dashboard' as ViewState, icon: 'home', label: 'Inicio' },
    { id: 'chat' as ViewState, icon: 'chatbubbles', label: 'Chat' },
    { id: 'wearables' as ViewState, icon: 'heart', label: 'Salud', isCenter: true },
    { id: 'history' as ViewState, icon: 'calendar', label: 'Citas' },
    { id: 'profile' as ViewState, icon: 'person', label: 'Perfil' },
  ];

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
          <View style={styles.navContent}>
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const isCenter = item.isCenter;

              if (isCenter) {
                return (
                  <View key={item.id} style={styles.centerButtonContainer}>
                    <TouchableOpacity
                      onPress={() => setCurrentView(item.id)}
                      style={[
                        styles.centerButton,
                        {
                          backgroundColor: RespiCareColors.primary,
                          shadowColor: RespiCareColors.primary,
                        },
                        isActive && styles.centerButtonActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name={item.icon as any} size={28} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setCurrentView(item.id)}
                  style={[styles.navButton, isActive && styles.navButtonActive]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      isActive && {
                        backgroundColor: `${RespiCareColors.primary}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={isActive ? RespiCareColors.primary : (isDark ? RespiCareColors.textTertiary : RespiCareColors.textSecondary)}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      ) : (
        <View
          style={[
            styles.androidContainer,
            {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderTopColor: isDark ? RespiCareColors.borderDark : RespiCareColors.border,
            },
          ]}
        >
          <View style={styles.navContent}>
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const isCenter = item.isCenter;

              if (isCenter) {
                return (
                  <View key={item.id} style={styles.centerButtonContainer}>
                    <TouchableOpacity
                      onPress={() => setCurrentView(item.id)}
                      style={[
                        styles.centerButton,
                        {
                          backgroundColor: RespiCareColors.primary,
                          shadowColor: RespiCareColors.primary,
                        },
                        isActive && styles.centerButtonActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name={item.icon as any} size={28} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setCurrentView(item.id)}
                  style={[styles.navButton, isActive && styles.navButtonActive]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      isActive && {
                        backgroundColor: `${RespiCareColors.primary}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={isActive ? RespiCareColors.primary : (isDark ? RespiCareColors.textTertiary : RespiCareColors.textSecondary)}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  blurContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
  },
  androidContainer: {
    borderRadius: 32,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    position: 'relative',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navButtonActive: {
    // Estilos adicionales si es necesario
  },
  iconContainer: {
    padding: 8,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonContainer: {
    position: 'absolute',
    left: '50%',
    top: -24,
    marginLeft: -32,
    zIndex: 10,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  centerButtonActive: {
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.5,
  },
});


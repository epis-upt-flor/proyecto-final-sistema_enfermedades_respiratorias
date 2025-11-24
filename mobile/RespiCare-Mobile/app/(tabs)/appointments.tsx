import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ModernCard } from '@/components/ui/ModernCard';
import { ModernButton } from '@/components/ui/ModernButton';
import { RespiCareColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useTranslation } from '@/lib/translations';
import { Ionicons } from '@expo/vector-icons';

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const t = useTranslation('es');
  const { 
    appointments, 
    isLoading: loading, 
    isOffline,
    fetchAppointments,
    checkConnectivity 
  } = useAppointmentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments().catch((err) => {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    });
  }, [fetchAppointments]);

  useFocusEffect(
    useCallback(() => {
      checkConnectivity().catch(() => undefined);
      fetchAppointments().catch((err) => {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      });
    }, [fetchAppointments, checkConnectivity])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await checkConnectivity();
      await fetchAppointments();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRefreshing(false);
    }
  }, [fetchAppointments, checkConnectivity]);

  const renderItem = ({ item }: { item: typeof appointments[0] }) => {
    const startDate = new Date(item.scheduledAt);
    const endDate = new Date(startDate.getTime() + item.durationMinutes * 60 * 1000);
    const month = startDate.toLocaleDateString('es', { month: 'short' }).toUpperCase();
    const day = startDate.getDate();
    
    const getStatusColor = () => {
      switch (item.status) {
        case 'scheduled': return '#14b8a6';
        case 'rescheduled': return '#f59e0b';
        case 'completed': return '#10b981';
        case 'cancelled': return '#ef4444';
        default: return '#94a3b8';
      }
    };

    return (
      <ModernCard
        style={styles.card}
        onPress={() => {}}
      >
        {item.syncStatus === 'pending' && (
          <View style={styles.offlineBadge}>
            <ThemedText style={styles.offlineText}>⏳ Pendiente de sincronización</ThemedText>
          </View>
        )}
        {item.syncStatus === 'error' && (
          <View style={[styles.offlineBadge, { backgroundColor: '#ef4444' }]}>
            <ThemedText style={styles.offlineText}>❌ Error al sincronizar</ThemedText>
          </View>
        )}
        <View style={styles.cardContent}>
          <View style={styles.dateContainer}>
            <View style={styles.dateBox}>
              <ThemedText style={styles.monthText}>{month}</ThemedText>
              <ThemedText style={styles.dayText}>{day}</ThemedText>
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>Consulta General</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
                  <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
                    {item.status === 'scheduled' ? 'Normal' : item.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.cardSubtitle}>
                Dr. García • Clínica Central
              </ThemedText>
              <ThemedText style={styles.timeText}>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={RespiCareColors.textTertiary} />
          </View>
        </View>
      </ModernCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? RespiCareColors.dark.background : RespiCareColors.light.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t.history.title}</ThemedText>
        <View style={styles.headerActions}>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <ThemedText style={styles.offlineIndicatorText}>📴 Modo Offline</ThemedText>
            </View>
          )}
          <ModernButton
            variant="icon"
            size="icon"
            onPress={() => {}}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color={RespiCareColors.primary} />
          </ModernButton>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={RespiCareColors.textTertiary} style={styles.searchIcon} />
        <View style={[styles.searchInput, { backgroundColor: isDark ? RespiCareColors.dark.backgroundSecondary : RespiCareColors.light.backgroundSecondary }]}>
          <ThemedText style={styles.searchPlaceholder}>{t.history.search}</ThemedText>
        </View>
      </View>

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={[styles.listContent, appointments.length === 0 && styles.emptyContainer]}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No tienes citas programadas.</ThemedText>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RespiCareColors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingLeft: 40,
    paddingRight: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RespiCareColors.borderDark,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: RespiCareColors.textTertiary,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  cardContent: {
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  monthText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3b82f6',
    textTransform: 'uppercase',
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    lineHeight: 20,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    fontSize: 14,
    color: RespiCareColors.textTertiary,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: RespiCareColors.textTertiary,
  },
  offlineBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  offlineText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  offlineIndicator: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  offlineIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: RespiCareColors.textTertiary,
    textAlign: 'center',
  },
  error: {
    color: RespiCareColors.error,
    marginBottom: 12,
    fontSize: 14,
  },
});


import React from 'react';
import { StyleSheet, ScrollView, RefreshControl, View, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useMedicalHistoryStore } from '@/stores/medicalHistoryStore';
import { ModernCard } from '@/components/ui/ModernCard';
import { ModernButton } from '@/components/ui/ModernButton';
import { RespiCareColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/lib/translations';
import { router } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, isAuthenticated } = useAuthStore();
  const { medicalHistories, fetchMedicalHistories } = useMedicalHistoryStore();
  const t = useTranslation('es');

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Simular datos del dashboard
      return {
        totalHistories: medicalHistories.length,
        recentSymptoms: medicalHistories.slice(0, 3),
        alerts: medicalHistories.filter(h => h.syncStatus === 'error').length
      };
    },
    enabled: isAuthenticated
  });

  const onRefresh = () => {
    refetch();
    fetchMedicalHistories();
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <ScrollView contentContainerStyle={styles.loginContainer}>
          {/* Logo/Icon */}
          <View style={{ marginBottom: 24 }}>
            <View style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: '#14b8a6',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#14b8a6',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}>
              <Ionicons name="pulse" size={48} color="#ffffff" />
            </View>
          </View>
          
          <ThemedText style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#f8fafc' }}>
            RespiCare
          </ThemedText>
          <ThemedText style={{ fontSize: 16, marginBottom: 32, textAlign: 'center', lineHeight: 24, color: '#94a3b8' }}>
            Sistema de Gestión de Enfermedades Respiratorias
          </ThemedText>
          
          <View style={{
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            borderRadius: 24,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 }}>
              Bienvenido
            </ThemedText>
            <ThemedText style={{ fontSize: 16, color: '#94a3b8', marginBottom: 24, lineHeight: 24 }}>
              Inicia sesión para acceder a tu historial médico y análisis de síntomas.
            </ThemedText>
            <TouchableOpacity
              onPress={() => {}}
              style={{
                backgroundColor: '#14b8a6',
                borderRadius: 24,
                paddingVertical: 18,
                paddingHorizontal: 32,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#14b8a6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <ThemedText style={{ color: '#ffffff', fontSize: 18, fontWeight: '600' }}>
                Iniciar Sesión
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#14b8a6', justifyContent: 'center', alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </ThemedText>
              </View>
              <View>
                <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 }}>
                  {t.dashboard.welcome.replace('Carlos', user?.name || 'Usuario')}
                </ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.2)', alignSelf: 'flex-start' }}>
                  <Ionicons name="wifi" size={12} color="#10b981" />
                  <ThemedText style={{ fontSize: 12, fontWeight: '600', color: '#10b981' }}>
                    {t.dashboard.sync_on}
                  </ThemedText>
                </View>
              </View>
            </View>
            <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
              <Ionicons name="alert-triangle" size={20} color="#f59e0b" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions Grid */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#f8fafc' }}>
              {t.dashboard.quick_actions}
            </ThemedText>
            <View style={styles.quickActionsGrid}>
              <ModernCard
                variant="glass"
                onPress={() => router.push('/(tabs)/chatbot')}
                style={{
                  width: '47%',
                  padding: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: '#3b82f6',
                }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(59, 130, 246, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="chatbubbles" size={24} color="#3b82f6" />
                </View>
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 }}>
                  {t.dashboard.qa_chat}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, fontWeight: '500', color: '#94a3b8' }}>
                  Asistente IA
                </ThemedText>
              </ModernCard>

              <ModernCard
                variant="glass"
                onPress={() => router.push('/(tabs)/explore')}
                style={{
                  width: '47%',
                  padding: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: '#8b5cf6',
                }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(139, 92, 246, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="pulse" size={24} color="#8b5cf6" />
                </View>
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 }}>
                  {t.dashboard.qa_symptoms}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, fontWeight: '500', color: '#94a3b8' }}>
                  Registrar
                </ThemedText>
              </ModernCard>

              <ModernCard
                variant="glass"
                onPress={() => router.push('/(tabs)/appointments')}
                style={{
                  width: '47%',
                  padding: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: '#f59e0b',
                }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(245, 158, 11, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="calendar" size={24} color="#f59e0b" />
                </View>
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 }}>
                  {t.dashboard.qa_calendar}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, fontWeight: '500', color: '#94a3b8' }}>
                  Agenda
                </ThemedText>
              </ModernCard>

              <ModernCard
                variant="glass"
                onPress={() => router.push('/(tabs)/wearables')}
                style={{
                  width: '47%',
                  padding: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: '#10b981',
                }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(16, 185, 129, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="watch" size={24} color="#10b981" />
                </View>
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 }}>
                  Salud
                </ThemedText>
                <ThemedText style={{ fontSize: 12, fontWeight: '500', color: '#94a3b8' }}>
                  Wearables
                </ThemedText>
              </ModernCard>
            </View>
          </View>

          {/* Daily Summary */}
          <ModernCard variant="gradient" style={{ marginBottom: 24, position: 'relative', padding: 24 }}>
            <View style={{ position: 'absolute', right: -20, top: -20, width: 128, height: 128, borderRadius: 64, backgroundColor: `${RespiCareColors.primary}20`, opacity: 0.5 }} />
            <View style={{ position: 'relative', zIndex: 10 }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 }}>
                Resumen Diario
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                Todo parece normal hoy.
              </ThemedText>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: '#334155' }}>
                <ThemedText style={{ fontSize: 12, fontWeight: '600', color: '#f8fafc' }}>
                  98% SpO2
                </ThemedText>
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: '#334155' }}>
                <ThemedText style={{ fontSize: 12, fontWeight: '600', color: '#f8fafc' }}>
                  72 BPM
                </ThemedText>
              </View>
            </View>
              <View style={{ position: 'absolute', right: 16, top: 16, width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: 'rgba(20, 184, 166, 0.3)', borderTopColor: '#14b8a6', justifyContent: 'center', alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: '#14b8a6' }}>
                  100%
                </ThemedText>
              </View>
            </View>
          </ModernCard>

          {/* Health Summary */}
          <View style={{
            backgroundColor: '#1e293b',
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 16 }}>
              Resumen de Salud
            </ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <ThemedText style={{ fontSize: 14, color: '#94a3b8' }}>
                Total de historias:
              </ThemedText>
              <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc' }}>
                {dashboardData?.totalHistories || 0}
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 14, color: '#94a3b8' }}>
                Alertas pendientes:
              </ThemedText>
              <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: dashboardData?.alerts ? '#f59e0b' : '#10b981' }}>
                {dashboardData?.alerts || 0}
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: RespiCareColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    backgroundColor: RespiCareColors.success + '20',
    alignSelf: 'flex-start',
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RespiCareColors.warning + '20',
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    padding: 20,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  summaryMetrics: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RespiCareColors.border,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressCircle: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: RespiCareColors.primary + '30',
    borderTopColor: RespiCareColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  healthCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthLabel: {
    fontSize: 14,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
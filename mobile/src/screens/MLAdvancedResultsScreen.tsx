/**
 * MLAdvancedResultsScreen
 * 
 * Pantalla móvil para mostrar resultados avanzados de ML:
 * - Explicaciones SHAP
 * - Comparación de modelos
 * - Recomendaciones optimizadas (RL)
 * - Historial de experimentos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  DataTable,
  Divider,
} from 'react-native-paper';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/apiService';
import { SimpleChart } from '../components/Analytics/SimpleChart';

interface MLAdvancedResultsScreenProps {
  route?: {
    params?: {
      analysisId?: string;
      experimentId?: string;
      sessionId?: string;
    };
  };
}

const MLAdvancedResultsScreen: React.FC<MLAdvancedResultsScreenProps> = ({ route }) => {
  const { user } = useAppStore();
  const { analysisId, experimentId, sessionId } = route?.params || {};
  
  const [activeTab, setActiveTab] = useState<'explanations' | 'comparison' | 'recommendations' | 'experiments'>('explanations');
  const [shapData, setShapData] = useState<any>(null);
  const [modelComparison, setModelComparison] = useState<any>(null);
  const [rlRecommendations, setRlRecommendations] = useState<any[]>([]);
  const [experimentHistory, setExperimentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [analysisId, experimentId, sessionId, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'explanations' && analysisId) {
        const response = await apiService.get(`/symptom-analyzer/ml-analyze/${analysisId}`);
        if (response.data?.success && response.data.data?.explanation) {
          setShapData(response.data.data.explanation);
        }
      }
      
      if (activeTab === 'comparison') {
        const response = await apiService.get('/ml/models/compare');
        if (response.data?.success) {
          setModelComparison(response.data.data);
        }
      }
      
      if (activeTab === 'recommendations' && sessionId) {
        const response = await apiService.get(`/ml/rl/session/${sessionId}/recommendations`);
        if (response.data?.success) {
          setRlRecommendations(response.data.data || []);
        }
      }
      
      if (activeTab === 'experiments') {
        const response = await apiService.get('/ml/experiments', {
          params: { limit: 20 }
        });
        if (response.data?.success) {
          setExperimentHistory(response.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading ML advanced results:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderTabButton = (tab: typeof activeTab, label: string, icon: string) => (
    <Button
      mode={activeTab === tab ? 'contained' : 'outlined'}
      onPress={() => setActiveTab(tab)}
      style={styles.tabButton}
      icon={icon}
    >
      {label}
    </Button>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.tabsContainer}>
        {renderTabButton('explanations', 'SHAP', 'chart-bar')}
        {renderTabButton('comparison', 'Comparar', 'scale-balance')}
        {renderTabButton('recommendations', 'RL', 'target')}
        {renderTabButton('experiments', 'Experimentos', 'flask')}
      </View>

      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Paragraph>Cargando resultados...</Paragraph>
        </View>
      )}

      {activeTab === 'explanations' && shapData && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Explicaciones SHAP</Title>
            <SimpleChart
              type="bar"
              data={shapData.factors?.map((f: any) => ({
                name: f.name,
                value: f.importance
              })) || []}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'comparison' && modelComparison && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Comparación de Modelos</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Modelo</DataTable.Title>
                <DataTable.Title numeric>Precisión</DataTable.Title>
                <DataTable.Title numeric>F1</DataTable.Title>
              </DataTable.Header>
              {modelComparison.models?.map((model: any, idx: number) => (
                <DataTable.Row key={idx}>
                  <DataTable.Cell>{model.name}</DataTable.Cell>
                  <DataTable.Cell numeric>{(model.precision * 100).toFixed(1)}%</DataTable.Cell>
                  <DataTable.Cell numeric>{(model.f1 * 100).toFixed(1)}%</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      )}

      {activeTab === 'recommendations' && (
        <View style={styles.recommendationsContainer}>
          {rlRecommendations.map((rec, idx) => (
            <Card key={idx} style={styles.card}>
              <Card.Content>
                <View style={styles.recommendationHeader}>
                  <Title style={styles.recommendationTitle}>{rec.action}</Title>
                  <Chip icon="check-circle" style={styles.confidenceChip}>
                    {(rec.confidence * 100).toFixed(0)}%
                  </Chip>
                </View>
                <Paragraph>{rec.recommendation}</Paragraph>
                <Divider style={styles.divider} />
                <View style={styles.stateInfo}>
                  <Paragraph style={styles.stateLabel}>
                    Adherencia: {(rec.state_summary?.adherence_rate * 100 || 0).toFixed(1)}%
                  </Paragraph>
                  <Paragraph style={styles.stateLabel}>
                    Recordatorios: {rec.state_summary?.recent_reminders || 0}
                  </Paragraph>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {activeTab === 'experiments' && (
        <View style={styles.experimentsContainer}>
          {experimentHistory.map((exp) => (
            <Card key={exp.experimentId} style={styles.card}>
              <Card.Content>
                <View style={styles.experimentHeader}>
                  <Title style={styles.experimentTitle}>{exp.modelName}</Title>
                  <Chip
                    style={[
                      styles.statusChip,
                      exp.status === 'completed' && styles.statusChipCompleted,
                      exp.status === 'failed' && styles.statusChipFailed,
                    ]}
                  >
                    {exp.status}
                  </Chip>
                </View>
                <Paragraph>Tipo: {exp.experimentType}</Paragraph>
                <Paragraph>
                  Duración: {exp.performance?.durationMs 
                    ? `${(exp.performance.durationMs / 1000).toFixed(1)}s`
                    : 'N/A'}
                </Paragraph>
                <Paragraph>
                  {new Date(exp.createdAt).toLocaleDateString()}
                </Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    minWidth: 100,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  recommendationsContainer: {
    padding: 10,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 18,
    textTransform: 'capitalize',
  },
  confidenceChip: {
    backgroundColor: '#1976d2',
  },
  divider: {
    marginVertical: 10,
  },
  stateInfo: {
    marginTop: 10,
  },
  stateLabel: {
    fontSize: 12,
    color: '#666',
  },
  experimentsContainer: {
    padding: 10,
  },
  experimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  experimentTitle: {
    fontSize: 16,
  },
  statusChip: {
    backgroundColor: '#9e9e9e',
  },
  statusChipCompleted: {
    backgroundColor: '#4caf50',
  },
  statusChipFailed: {
    backgroundColor: '#f44336',
  },
});

export default MLAdvancedResultsScreen;


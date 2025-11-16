import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { localStorageService } from '../services/localStorage';
import { SymptomAnalysis } from '../types';

const FeatureBar = ({ name, value }: { name: string; value: number }) => {
  const width = Math.max(5, Math.min(100, Math.round(Math.abs(value) * 100)));
  const positive = value >= 0;
  return (
    <View style={{ marginVertical: 4 }}>
      <Paragraph style={{ color: '#555', marginBottom: 4 }}>{name}</Paragraph>
      <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' }}>
        <View
          style={{
            width: `${width}%`,
            height: 8,
            backgroundColor: positive ? '#4caf50' : '#d32f2f',
          }}
        />
      </View>
    </View>
  );
};

const SymptomAnalysesScreen: React.FC = () => {
  const [analyses, setAnalyses] = useState<SymptomAnalysis[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await localStorageService.getSymptomAnalyses();
      setAnalyses(list.reverse());
    } catch {
      setAnalyses([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const getChip = (urgency: any) => {
    switch (urgency) {
      case 'high':
        return { text: 'ALTA', color: '#d32f2f' };
      case 'medium':
        return { text: 'MEDIA', color: '#f57c00' };
      default:
        return { text: 'BAJA', color: '#388e3c' };
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={analyses}
        keyExtractor={(item, idx) => (item as any).id || `${idx}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        getItemLayout={(_, index) => ({
          length: 200, // Altura aproximada de cada card
          offset: 200 * index,
          index,
        })}
        renderItem={({ item }) => {
          const chip = getChip((item as any).urgencyLevel || 'low');
          const generatedAt = (item as any).analyzedAt || (item as any).createdAt || new Date().toISOString();
          const factors: Array<{ feature: string; contribution: number }> =
            ((item as any).explanation?.decision_factors as any[]) ||
            ((item as any).topContributingFeatures as any[]) ||
            [];
          const top = factors.slice(0, 5).map((f) =>
            'feature' in f ? f : { feature: String((f as any).name || 'factor'), contribution: Number((f as any).value || 0.1) }
          );
          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.header}>
                  <View style={{ flex: 1 }}>
                    <Title style={styles.title}>Análisis de Síntomas</Title>
                    <Paragraph style={styles.subtitle}>{new Date(generatedAt).toLocaleString()}</Paragraph>
                  </View>
                  <Chip mode="outlined" style={{ borderColor: chip.color }} textStyle={{ color: chip.color }}>
                    {chip.text}
                  </Chip>
                </View>
                {top.length > 0 ? (
                  <View style={{ marginTop: 8 }}>
                    <Paragraph style={{ color: '#333', marginBottom: 8 }}>Factores (SHAP simple)</Paragraph>
                    {top.map((f, idx) => (
                      <FeatureBar key={`${f.feature}-${idx}`} name={f.feature} value={f.contribution} />
                    ))}
                  </View>
                ) : (
                  <Paragraph style={{ color: '#777', marginTop: 8 }}>
                    Sin factores disponibles para este análisis.
                  </Paragraph>
                )}
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 12, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#666' },
});

export default SymptomAnalysesScreen;



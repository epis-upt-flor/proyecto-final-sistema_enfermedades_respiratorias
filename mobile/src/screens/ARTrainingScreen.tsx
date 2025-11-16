import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, Chip, ProgressBar } from 'react-native-paper';
import { RootStackParamList } from '../types';
import { arService, ARMarker, ARScene } from '../services/arService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../services/analyticsService';

const AR_MODE_KEY = 'ar_last_mode';

type Props = {
  route: RouteProp<RootStackParamList, 'ARTraining'>;
};

const stepsBreathing = [
  { id: 's1', title: 'Inhala', description: 'Inhala lentamente por 4 segundos', durationMs: 4000 },
  { id: 's2', title: 'Sostén', description: 'Mantén el aire por 4 segundos', durationMs: 4000 },
  { id: 's3', title: 'Exhala', description: 'Exhala lentamente por 6 segundos', durationMs: 6000 },
];

const stepsInhaler = [
  { id: 'i1', title: 'Preparación', description: 'Agita el inhalador y retira la tapa', durationMs: 4000 },
  { id: 'i2', title: 'Exhala', description: 'Exhala completamente antes de usar', durationMs: 4000 },
  { id: 'i3', title: 'Inhala y presiona', description: 'Sella con los labios, inhala y presiona el inhalador', durationMs: 5000 },
  { id: 'i4', title: 'Sostén', description: 'Mantén el aire durante 10 segundos', durationMs: 10000 },
];

const ARTrainingScreen: React.FC<Props> = () => {
  const { params } = useRoute<Props['route']>();
  const [mode, setMode] = useState<'breathing' | 'inhaler'>(params?.mode ?? 'breathing');
  const [restoredNote, setRestoredNote] = useState<string | null>(null);
  const steps = useMemo(() => (mode === 'inhaler' ? stepsInhaler : stepsBreathing), [mode]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Cargar último modo si no viene por params
  useEffect(() => {
    (async () => {
      analyticsService.logEvent('ar.screen_open');
      if (params?.mode) return;
      try {
        const saved = await AsyncStorage.getItem(AR_MODE_KEY);
        if (saved === 'breathing' || saved === 'inhaler') {
          setMode(saved);
          setRestoredNote(`Usando modo anterior: ${saved === 'inhaler' ? 'Inhalador' : 'Respiración'}`);
          // Ocultar la nota después de unos segundos
          setTimeout(() => setRestoredNote(null), 3500);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar último modo seleccionado
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(AR_MODE_KEY, mode);
      } catch {}
    })();
  }, [mode]);

  const startAR = useCallback(async () => {
    analyticsService.logEvent('ar.start', { mode });
    const ok = await arService.startARSession();
    if (!ok) {
      Alert.alert('AR no disponible', 'No se pudo iniciar la sesión AR en este dispositivo.');
      return;
    }
    // Cargar escena inicial con un marcador de guía
    const scene: ARScene = {
      id: `scene_${mode}`,
      markers: [
        {
          id: 'guide_1',
          position: { x: 0, y: 0, z: -1 },
          type: 'instruction',
          content: 'Mantén el dispositivo frente a ti',
          visible: true,
        } as ARMarker,
      ],
    };
    await arService.loadScene(scene);
    setRunning(true);
  }, [mode]);

  const stopAR = useCallback(async () => {
    analyticsService.logEvent('ar.stop', { mode });
    await arService.stopARSession();
    setRunning(false);
    setCurrentStepIndex(0);
    setProgress(0);
  }, []);

  // Si cambia el modo, reiniciar progreso/estado
  useEffect(() => {
    setCurrentStepIndex(0);
    setProgress(0);
    if (running) {
      // Reiniciar la sesión para refrescar la escena
      (async () => {
        await arService.stopARSession();
        await startAR();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    let raf: any;
    let startTs: number | null = null;

    if (running) {
      const step = steps[currentStepIndex];
      const loop = (ts: number) => {
        if (startTs === null) startTs = ts;
        const elapsed = ts - startTs;
        const p = Math.min(elapsed / step.durationMs, 1);
        setProgress(p);
        if (p < 1) {
          raf = requestAnimationFrame(loop);
        } else {
          // Avanzar al siguiente paso
          setProgress(0);
          setCurrentStepIndex((idx) => {
            const next = idx + 1;
            if (next >= steps.length) {
              // Finalizado
              stopAR();
              Alert.alert('Completado', 'Has finalizado la rutina.');
              return idx;
            }
            return next;
          });
        }
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [running, currentStepIndex, steps, stopAR]);

  const step = steps[currentStepIndex];

  return (
    <View style={styles.container}>
      {/* Placeholder de vista AR */}
      <View style={styles.arViewport}>
        <Paragraph style={styles.arPlaceholderText}>AR View Placeholder</Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title>{mode === 'inhaler' ? 'Uso de inhalador (AR)' : 'Ejercicio respiratorio (AR)'}</Title>
            <Chip mode="outlined">{running ? 'En progreso' : 'Listo'}</Chip>
          </View>

          {/* Nota de modo restaurado */}
          {restoredNote && (
            <Paragraph style={styles.restoreNote}>{restoredNote}</Paragraph>
          )}

          {/* Switch de modo */}
          <View style={styles.modeSwitchRow}>
            <Chip
              style={[styles.modeChip, mode === 'breathing' && styles.modeChipSelected]}
              selected={mode === 'breathing'}
              onPress={() => { analyticsService.logEvent('ar.mode_change', { to: 'breathing' }); setMode('breathing'); }}
            >
              Respiración
            </Chip>
            <Chip
              style={[styles.modeChip, mode === 'inhaler' && styles.modeChipSelected]}
              selected={mode === 'inhaler'}
              onPress={() => { analyticsService.logEvent('ar.mode_change', { to: 'inhaler' }); setMode('inhaler'); }}
            >
              Inhalador
            </Chip>
          </View>

          <Paragraph style={{ marginTop: 4 }}>
            {mode === 'inhaler'
              ? 'Sigue las instrucciones paso a paso para usar correctamente el inhalador.'
              : 'Sigue el ritmo guiado para mejorar tu técnica respiratoria.'}
          </Paragraph>

          <View style={styles.stepBox}>
            <Title style={styles.stepTitle}>{step.title}</Title>
            <Paragraph style={styles.stepDesc}>{step.description}</Paragraph>
            <ProgressBar progress={progress} color="#1976d2" style={{ marginTop: 8 }} />
          </View>

          <View style={styles.actions}>
            {!running ? (
              <Button mode="contained" onPress={startAR}>Iniciar</Button>
            ) : (
              <Button mode="outlined" onPress={stopAR}>Detener</Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  arViewport: {
    height: width * 0.75,
    borderRadius: 12,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  arPlaceholderText: {
    color: '#fff',
    opacity: 0.6,
  },
  card: { elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restoreNote: { marginTop: 8, color: '#666' },
  modeSwitchRow: { flexDirection: 'row', marginTop: 12 },
  modeChip: { marginRight: 8 },
  modeChipSelected: { backgroundColor: '#e3f2fd' },
  stepBox: { marginTop: 16, paddingVertical: 8 },
  stepTitle: { fontSize: 18 },
  stepDesc: { color: '#666', marginTop: 4 },
  actions: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end' },
});

export default ARTrainingScreen;



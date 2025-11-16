/**
 * Tutorial Overlay Component
 * 
 * Componente para mostrar tutorial interactivo con hints contextuales
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface TutorialStep {
  id: string;
  target: string; // testID del elemento objetivo
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showSkip?: boolean;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  visible: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  steps,
  visible,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetLayout, setTargetLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible && steps.length > 0) {
      findTargetElement(steps[currentStep].target);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentStep]);

  const findTargetElement = (testID: string) => {
    // En React Native, necesitamos usar findNodeHandle o medir manualmente
    // Por ahora, usamos un enfoque simplificado
    // En producción, se podría usar react-native-tooltip o similar
    setTargetLayout({
      x: width * 0.1,
      y: height * 0.3,
      width: width * 0.8,
      height: 60,
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  };

  const handleComplete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      handleComplete();
    }
  };

  if (!visible || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const position = step.position || 'bottom';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        {/* Overlay oscuro con agujero */}
        <View style={styles.darkOverlay}>
          {targetLayout && (
            <View
              style={[
                styles.hole,
                {
                  left: targetLayout.x - 10,
                  top: targetLayout.y - 10,
                  width: targetLayout.width + 20,
                  height: targetLayout.height + 20,
                },
              ]}
            />
          )}
        </View>

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltipContainer,
            getTooltipPosition(position, targetLayout),
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Card style={styles.tooltip}>
            <Card.Content>
              <View style={styles.tooltipHeader}>
                <Title style={styles.tooltipTitle}>{step.title}</Title>
                {step.showSkip && (
                  <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Icon name="close" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
              <Paragraph style={styles.tooltipDescription}>
                {step.description}
              </Paragraph>
              <View style={styles.tooltipActions}>
                {currentStep > 0 && (
                  <Button mode="outlined" onPress={handlePrevious} style={styles.actionButton}>
                    Anterior
                  </Button>
                )}
                <Button
                  mode="contained"
                  onPress={handleNext}
                  style={[styles.actionButton, styles.primaryButton]}
                >
                  {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </Button>
              </View>
              <View style={styles.tooltipProgress}>
                {steps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index === currentStep && styles.progressDotActive,
                    ]}
                  />
                ))}
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      </View>
    </Modal>
  );
};

const getTooltipPosition = (
  position: string,
  targetLayout: { x: number; y: number; width: number; height: number } | null
) => {
  if (!targetLayout) {
    return { top: height * 0.5, left: width * 0.1 };
  }

  switch (position) {
    case 'top':
      return {
        top: targetLayout.y - 200,
        left: targetLayout.x + targetLayout.width / 2 - 150,
      };
    case 'bottom':
      return {
        top: targetLayout.y + targetLayout.height + 20,
        left: targetLayout.x + targetLayout.width / 2 - 150,
      };
    case 'left':
      return {
        top: targetLayout.y + targetLayout.height / 2 - 100,
        left: targetLayout.x - 320,
      };
    case 'right':
      return {
        top: targetLayout.y + targetLayout.height / 2 - 100,
        left: targetLayout.x + targetLayout.width + 20,
      };
    default:
      return {
        top: targetLayout.y + targetLayout.height + 20,
        left: targetLayout.x + targetLayout.width / 2 - 150,
      };
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  hole: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#1976d2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  tooltipContainer: {
    position: 'absolute',
    width: 300,
    zIndex: 1000,
  },
  tooltip: {
    elevation: 8,
    borderRadius: 12,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  skipButton: {
    padding: 4,
  },
  tooltipDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  tooltipActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    minWidth: 100,
  },
  primaryButton: {
    backgroundColor: '#1976d2',
  },
  tooltipProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  progressDotActive: {
    backgroundColor: '#1976d2',
    width: 24,
  },
});

export default TutorialOverlay;


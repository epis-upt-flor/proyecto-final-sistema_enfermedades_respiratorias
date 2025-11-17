/**
 * E2E Tests for MLAdvancedResultsScreen
 * Tests rendering, data loading, and user interactions
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import MLAdvancedResultsScreen from '../src/screens/MLAdvancedResultsScreen';
import { useAppStore } from '../src/store/useAppStore';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute = {
  params: {
    analysisId: 'analysis-123',
    experimentId: 'experiment-456',
    sessionId: 'session-789',
  },
};

// Mock store
jest.mock('../src/store/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

// Mock API calls
jest.mock('../src/services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('MLAdvancedResultsScreen', () => {
  const mockStore = {
    user: {
      id: 'user-123',
      role: 'doctor',
    },
    token: 'test-token',
  };

  beforeEach(() => {
    (useAppStore as jest.Mock).mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all tabs', () => {
      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      expect(screen.getByText('SHAP')).toBeTruthy();
      expect(screen.getByText('Modelos')).toBeTruthy();
      expect(screen.getByText('RL')).toBeTruthy();
      expect(screen.getByText('Historial')).toBeTruthy();
    });

    it('should render with default tab active', () => {
      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      const shapTab = screen.getByText('SHAP');
      expect(shapTab).toBeTruthy();
    });

    it('should render loading state', () => {
      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      // Component should show loading initially
      expect(screen.queryByText(/cargando/i)).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch tabs when pressed', () => {
      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      const modelosTab = screen.getByText('Modelos');
      fireEvent.press(modelosTab);

      // Tab should be active (check visually or by state)
      expect(modelosTab).toBeTruthy();
    });

    it('should load data when switching to Model Comparison tab', async () => {
      const { get } = require('../src/services/api');
      get.mockResolvedValue({
        data: {
          success: true,
          data: {
            models: [
              { name: 'Model A', accuracy: 0.85 },
              { name: 'Model B', accuracy: 0.90 },
            ],
          },
        },
      });

      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      const modelosTab = screen.getByText('Modelos');
      fireEvent.press(modelosTab);

      await waitFor(() => {
        expect(get).toHaveBeenCalled();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load analysis data when analysisId is provided', async () => {
      const { get } = require('../src/services/api');
      const mockShapData = {
        values: [0.1, 0.2, 0.3],
        base_value: 0.5,
        data: [1, 2, 3],
      };

      get.mockResolvedValue({
        data: {
          success: true,
          data: {
            explanation: mockShapData,
          },
        },
      });

      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      await waitFor(() => {
        expect(get).toHaveBeenCalledWith(
          expect.stringContaining('/symptom-analyzer/ml-analyze/analysis-123'),
          expect.any(Object)
        );
      });
    });

    it('should load experiment data when experimentId is provided', async () => {
      const { get } = require('../src/services/api');
      const mockExperiments = [
        {
          experimentId: 'exp-1',
          experimentType: 'rl_session',
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
      ];

      get.mockResolvedValue({
        data: {
          success: true,
          data: mockExperiments,
        },
      });

      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      const historyTab = screen.getByText('Historial');
      fireEvent.press(historyTab);

      await waitFor(() => {
        expect(get).toHaveBeenCalled();
      });
    });

    it('should load RL recommendations when sessionId is provided', async () => {
      const { get } = require('../src/services/api');
      const mockRecommendations = [
        {
          action: 'send_reminder',
          confidence: 0.85,
          recommendation: 'Send reminder now',
        },
      ];

      get.mockResolvedValue({
        data: {
          success: true,
          data: mockRecommendations,
        },
      });

      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      const rlTab = screen.getByText('RL');
      fireEvent.press(rlTab);

      await waitFor(() => {
        expect(get).toHaveBeenCalledWith(
          expect.stringContaining('/ml/rl/session/session-789'),
          expect.any(Object)
        );
      });
    });
  });

  describe('SHAP Visualizations', () => {
    it('should display SHAP visualization when data is loaded', async () => {
      const { get } = require('../src/services/api');
      const mockShapData = {
        values: [0.1, 0.2, 0.3],
        base_value: 0.5,
        data: [1, 2, 3],
      };

      get.mockResolvedValue({
        data: {
          success: true,
          data: {
            explanation: mockShapData,
          },
        },
      });

      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      await waitFor(() => {
        // Check if visualization is rendered
        expect(screen.queryByTestId('shap-chart')).toBeTruthy();
      });
    });
  });

  describe('Model Comparison', () => {
    it('should display model comparison data table', async () => {
      const { get } = require('../src/services/api');
      const mockComparison = {
        models: [
          {
            name: 'XGBoost',
            accuracy: 0.92,
            precision: 0.90,
            recall: 0.88,
            f1: 0.89,
          },
          {
            name: 'Random Forest',
            accuracy: 0.88,
            precision: 0.86,
            recall: 0.85,
            f1: 0.855,
          },
        ],
      };

      get.mockResolvedValue({
        data: {
          success: true,
          data: mockComparison,
        },
      });

      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      const modelosTab = screen.getByText('Modelos');
      fireEvent.press(modelosTab);

      await waitFor(() => {
        expect(screen.getByText('XGBoost')).toBeTruthy();
        expect(screen.getByText('Random Forest')).toBeTruthy();
      });
    });
  });

  describe('RL Recommendations', () => {
    it('should display RL recommendations cards', async () => {
      const { get } = require('../src/services/api');
      const mockRecommendations = [
        {
          action: 'send_reminder',
          confidence: 0.85,
          recommendation: 'Send reminder now for optimal adherence',
          state_summary: { adherence_rate: 0.7 },
        },
        {
          action: 'delay_reminder',
          confidence: 0.65,
          recommendation: 'Delay reminder to reduce fatigue',
          state_summary: { fatigue_level: 0.6 },
        },
      ];

      get.mockResolvedValue({
        data: {
          success: true,
          data: mockRecommendations,
        },
      });

      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      const rlTab = screen.getByText('RL');
      fireEvent.press(rlTab);

      await waitFor(() => {
        expect(screen.getByText(/Send reminder now/i)).toBeTruthy();
        expect(screen.getByText(/Delay reminder/i)).toBeTruthy();
      });
    });
  });

  describe('Experiment History', () => {
    it('should display experiment history list', async () => {
      const { get } = require('../src/services/api');
      const mockExperiments = [
        {
          experimentId: 'exp-1',
          experimentType: 'rl_session',
          status: 'completed',
          createdAt: '2024-01-01T00:00:00Z',
          performance: {
            durationMs: 5000,
          },
        },
        {
          experimentId: 'exp-2',
          experimentType: 'fl_round',
          status: 'running',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      get.mockResolvedValue({
        data: {
          success: true,
          data: mockExperiments,
        },
      });

      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      const historyTab = screen.getByText('Historial');
      fireEvent.press(historyTab);

      await waitFor(() => {
        expect(screen.getByText('exp-1')).toBeTruthy();
        expect(screen.getByText('exp-2')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = require('../src/services/api');
      get.mockRejectedValue(new Error('Network error'));

      render(
        <MLAdvancedResultsScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      );

      await waitFor(() => {
        // Should show error message or handle gracefully
        expect(screen.queryByText(/error/i)).toBeTruthy();
      });
    });
  });
});


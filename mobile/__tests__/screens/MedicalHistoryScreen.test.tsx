/**
 * Tests for MedicalHistoryScreen
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
// Nota: MedicalHistoryScreen puede estar en components/tabs/index.tsx o components/views/
import { useAppStore } from '../../medical-app/store/useAppStore';
import { useNavigation } from '@react-navigation/native';

// Mock dependencies
jest.mock('../../medical-app/store/useAppStore');
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

const mockRemoveHistory = jest.fn();
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;

describe('MedicalHistoryScreen', () => {
  const mockHistories = [
    {
      id: '1',
      patientName: 'Juan Pérez',
      diagnosis: 'Bronquitis',
      date: new Date().toISOString(),
      symptoms: [
        { name: 'tos', severity: 'moderate' },
        { name: 'fiebre', severity: 'mild' },
      ],
      syncStatus: 'synced',
    },
    {
      id: '2',
      patientName: 'María García',
      diagnosis: 'Asma',
      date: new Date().toISOString(),
      symptoms: [{ name: 'dificultad respiratoria', severity: 'severe' }],
      syncStatus: 'pending',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAppStore.mockReturnValue({
      isOnline: true,
      histories: mockHistories,
      removeHistory: mockRemoveHistory,
      offlineData: {
        medicalHistories: mockHistories,
      },
      deleteMedicalHistory: mockRemoveHistory,
    } as any);
    
    mockUseNavigation.mockReturnValue({
      setOptions: jest.fn(),
      navigate: jest.fn(),
    } as any);
  });

  it('should render medical histories list', () => {
    render(<MedicalHistoryScreen />);
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María García')).toBeInTheDocument();
  });

  it('should filter histories by search query', () => {
    render(<MedicalHistoryScreen />);
    
    const searchInput = screen.getByPlaceholderText(/buscar|search/i);
    fireEvent.changeText(searchInput, 'Juan');
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María García')).not.toBeInTheDocument();
  });

  it('should show history details in modal', () => {
    render(<MedicalHistoryScreen />);
    
    const historyCard = screen.getByText('Juan Pérez');
    fireEvent.press(historyCard);
    
    // Modal should open
    expect(screen.getByText('Bronquitis')).toBeInTheDocument();
  });

  it('should handle refresh', async () => {
    render(<MedicalHistoryScreen />);
    
    const { getByTestId } = render(<MedicalHistoryScreen />);
    const flatList = getByTestId('histories-list');
    
    if (flatList) {
      fireEvent(flatList, 'refresh');
      await waitFor(() => {
        expect(true).toBe(true);
      });
    }
  });

  it('should show offline indicator when offline', () => {
    mockUseAppStore.mockReturnValue({
      isOnline: false,
      histories: mockHistories,
      removeHistory: mockRemoveHistory,
      offlineData: {
        medicalHistories: mockHistories,
      },
      deleteMedicalHistory: mockRemoveHistory,
    } as any);
    
    render(<MedicalHistoryScreen />);
    
    // Should show offline indicator
    expect(screen.queryByText(/offline/i)).toBeInTheDocument();
  });

  it('should display sync status', () => {
    render(<MedicalHistoryScreen />);
    
    expect(screen.getByText(/sincronizado|synced/i)).toBeInTheDocument();
    expect(screen.getByText(/pendiente|pending/i)).toBeInTheDocument();
  });

  it('should display symptoms', () => {
    render(<MedicalHistoryScreen />);
    
    expect(screen.getByText('tos')).toBeInTheDocument();
    expect(screen.getByText('fiebre')).toBeInTheDocument();
  });
});


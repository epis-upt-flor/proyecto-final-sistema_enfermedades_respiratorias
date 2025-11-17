/**
 * Tests for TutorialOverlay Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import TutorialOverlay from '../../src/components/Tutorial/TutorialOverlay';

describe('TutorialOverlay', () => {
  const mockSteps = [
    {
      id: 'step1',
      title: 'Bienvenido',
      description: 'Esta es la primera pantalla',
      target: 'element1',
    },
    {
      id: 'step2',
      title: 'Siguiente paso',
      description: 'Esta es la segunda pantalla',
      target: 'element2',
    },
  ];

  it('should render tutorial overlay', () => {
    render(<TutorialOverlay steps={mockSteps} visible={true} />);
    
    expect(screen.getByText('Bienvenido')).toBeInTheDocument();
  });

  it('should not render when not visible', () => {
    render(<TutorialOverlay steps={mockSteps} visible={false} />);
    
    expect(screen.queryByText('Bienvenido')).not.toBeInTheDocument();
  });

  it('should navigate to next step', () => {
    const onNext = jest.fn();
    render(<TutorialOverlay steps={mockSteps} visible={true} onNext={onNext} />);
    
    const nextButton = screen.getByText(/siguiente|next/i);
    fireEvent.press(nextButton);
    
    expect(onNext).toHaveBeenCalled();
  });

  it('should navigate to previous step', () => {
    const onPrevious = jest.fn();
    render(<TutorialOverlay steps={mockSteps} visible={true} currentStep={1} onPrevious={onPrevious} />);
    
    const prevButton = screen.getByText(/anterior|previous/i);
    fireEvent.press(prevButton);
    
    expect(onPrevious).toHaveBeenCalled();
  });

  it('should close tutorial', () => {
    const onClose = jest.fn();
    render(<TutorialOverlay steps={mockSteps} visible={true} onClose={onClose} />);
    
    const closeButton = screen.getByText(/cerrar|close|omitir|skip/i);
    fireEvent.press(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should show step indicator', () => {
    render(<TutorialOverlay steps={mockSteps} visible={true} currentStep={0} />);
    
    // Should show step indicator (e.g., "1 / 2")
    expect(screen.getByText(/1.*2|step 1/i)).toBeInTheDocument();
  });

  it('should handle last step', () => {
    const onFinish = jest.fn();
    render(<TutorialOverlay steps={mockSteps} visible={true} currentStep={1} onFinish={onFinish} />);
    
    const finishButton = screen.getByText(/finalizar|finish|comenzar|start/i);
    fireEvent.press(finishButton);
    
    expect(onFinish).toHaveBeenCalled();
  });
});


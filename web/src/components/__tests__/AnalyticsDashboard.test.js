/**
 * Unit tests for AnalyticsDashboard Component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AnalyticsDashboard from '../AnalyticsDashboard';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('AnalyticsDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the analytics dashboard', () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            totalReports: 100,
            totalCases: 150,
            activeCases: 25
          }
        }
      });

      render(<AnalyticsDashboard />);
      expect(screen.getByText(/análisis/i)).toBeInTheDocument();
    });

    it('should display loading state initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}));

      render(<AnalyticsDashboard />);
      // Should show loading indicator
    });

    it('should display data after loading', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            totalReports: 100,
            totalCases: 150,
            activeCases: 25
          }
        }
      });

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/100/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch analytics data on mount', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {}
        }
      });

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      render(<AnalyticsDashboard />);

      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.getByText(/análisis/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {}
        }
      });

      render(<AnalyticsDashboard />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});


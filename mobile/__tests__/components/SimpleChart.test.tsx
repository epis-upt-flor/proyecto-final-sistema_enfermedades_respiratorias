/**
 * Tests for SimpleChart Component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import SimpleChart from '../../src/components/Analytics/SimpleChart';

describe('SimpleChart', () => {
  const mockData = [
    { label: 'Jan', value: 10 },
    { label: 'Feb', value: 20 },
    { label: 'Mar', value: 30 },
  ];

  it('should render with data', () => {
    const { getByTestId } = render(<SimpleChart data={mockData} testID="simple-chart" />);
    expect(getByTestId('simple-chart')).toBeDefined();
  });

  it('should render with title', () => {
    const { getByText } = render(<SimpleChart data={mockData} title="Test Chart" />);
    expect(getByText('Test Chart')).toBeDefined();
  });

  it('should handle empty data', () => {
    const { getByTestId } = render(<SimpleChart data={[]} testID="simple-chart" />);
    expect(getByTestId('simple-chart')).toBeDefined();
  });

  it('should handle different chart types', () => {
    const { rerender, getByTestId } = render(
      <SimpleChart data={mockData} type="line" testID="simple-chart" />
    );
    expect(getByTestId('simple-chart')).toBeDefined();

    rerender(<SimpleChart data={mockData} type="bar" testID="simple-chart" />);
    expect(getByTestId('simple-chart')).toBeDefined();
  });
});


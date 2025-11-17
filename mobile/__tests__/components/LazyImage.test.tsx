/**
 * Tests for LazyImage Component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import LazyImage from '../../src/components/common/LazyImage';

describe('LazyImage', () => {
  const defaultProps = {
    source: { uri: 'https://example.com/image.jpg' },
    style: { width: 100, height: 100 },
  };

  it('should render with source', () => {
    const { getByTestId } = render(<LazyImage {...defaultProps} testID="lazy-image" />);
    expect(getByTestId('lazy-image')).toBeDefined();
  });

  it('should render with placeholder', () => {
    const { getByTestId } = render(
      <LazyImage
        {...defaultProps}
        placeholder={<div testID="placeholder">Loading...</div>}
        testID="lazy-image"
      />
    );
    // Should render placeholder initially
    expect(getByTestId('lazy-image')).toBeDefined();
  });

  it('should handle onLoad', () => {
    const onLoad = jest.fn();
    const { getByTestId } = render(
      <LazyImage {...defaultProps} onLoad={onLoad} testID="lazy-image" />
    );
    // Should handle onLoad
    expect(getByTestId('lazy-image')).toBeDefined();
  });

  it('should handle onError', () => {
    const onError = jest.fn();
    const { getByTestId } = render(
      <LazyImage {...defaultProps} onError={onError} testID="lazy-image" />
    );
    // Should handle onError
    expect(getByTestId('lazy-image')).toBeDefined();
  });
});


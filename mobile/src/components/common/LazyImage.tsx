import React, { memo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  source: ImageProps['source'];
  containerStyle?: StyleProp<ViewStyle>;
  loadingIndicatorColor?: string;
}

const LazyImageComponent: React.FC<LazyImageProps> = ({
  source,
  containerStyle,
  loadingIndicatorColor = '#1976d2',
  style,
  onLoadEnd,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadEnd = useCallback(
    (event: any) => {
      setIsLoading(false);
      onLoadEnd?.(event);
    },
    [onLoadEnd]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={loadingIndicatorColor} />
        </View>
      )}
      <Image
        source={source}
        style={[styles.image, style]}
        onLoadEnd={handleLoadEnd}
        fadeDuration={150}
        {...rest}
      />
    </View>
  );
};

export const LazyImage = memo(LazyImageComponent);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});



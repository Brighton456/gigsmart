import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

const LazyAsset = ({ assetSource, style, children, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate lazy loading - in production, this would be actual lazy loading
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]} {...props}>
        <ActivityIndicator size="small" color="#1e40af" />
      </View>
    );
  }

  return children;
};

export default LazyAsset;

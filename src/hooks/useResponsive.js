import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

const getBreakpoint = (width) => {
  if (width < 380) return 'small';
  if (width < 768) return 'medium';
  return 'large';
};

export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState(() => 
    getBreakpoint(Dimensions.get('window').width)
  );

  useEffect(() => {
    const onChange = ({ window }) => {
      setBreakpoint(getBreakpoint(window.width));
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  return {
    breakpoint,
    isSmall: breakpoint === 'small',
    isMedium: breakpoint === 'medium',
    isLarge: breakpoint === 'large',
    isMobile: breakpoint !== 'large',
    isTablet: breakpoint === 'large' && Platform.OS !== 'web',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  };
};

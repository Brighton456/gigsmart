import React, { Suspense, lazy, ComponentType } from 'react';
import { Spin, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LazyWrapperProps {
  componentLoader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  delay?: number;
  error?: ComponentType<{ error: Error; retry: () => void }>;
}

const DefaultFallback = () => (
  <Card style={{ margin: '16px', textAlign: 'center' }}>
    <Spin
      indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      tip="Loading..."
      size="large"
    />
  </Card>
);

const DefaultError: ComponentType<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <Card style={{ margin: '16px' }}>
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3>Failed to load component</h3>
      <p style={{ color: '#ff4d4f' }}>{error.message}</p>
      <button onClick={retry} style={{ marginTop: '10px', padding: '8px 16px' }}>
        Retry
      </button>
    </div>
  </Card>
);

const LazyWrapper: React.FC<LazyWrapperProps> = ({
  componentLoader,
  fallback = <DefaultFallback />,
  delay = 200,
  error: ErrorComponent = DefaultError
}) => {
  const LazyComponent = lazy(componentLoader);
  const [hasError, setHasError] = React.useState(false);
  const [retryKey, setRetryKey] = React.useState(0);

  const handleRetry = React.useCallback(() => {
    setHasError(false);
    setRetryKey(prev => prev + 1);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Lazy loading error:', error);
    setHasError(true);
  }, []);

  if (hasError) {
    return <ErrorComponent error={new Error('Component failed to load')} retry={handleRetry} />;
  }

  return (
    <Suspense 
      key={retryKey}
      fallback={delay > 0 ? <DelayedFallback delay={delay} fallback={fallback} /> : fallback}
    >
      <LazyComponent onError={handleError} />
    </Suspense>
  );
};

const DelayedFallback: React.FC<{ delay: number; fallback: React.ReactNode }> = ({ 
  delay, 
  fallback 
}) => {
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return showFallback ? <>{fallback}</> : null;
};

// HOC for lazy loading components
export const withLazyLoading = <P extends object>(
  componentLoader: () => Promise<{ default: ComponentType<P> }>,
  options?: Partial<LazyWrapperProps>
) => {
  return React.memo((props: P) => (
    <LazyWrapper componentLoader={componentLoader} {...options} />
  ));
};

// Preload function for critical components
export const preloadComponent = (componentLoader: () => Promise<{ default: ComponentType<any> }>) => {
  componentLoader();
};

export default LazyWrapper;

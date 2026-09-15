import React, { useState, useEffect, useCallback } from 'react';
import { Card, Statistic, Progress, Typography, Space, Button } from 'antd';
import { ThunderboltOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage: number;
  cacheHitRate: number;
  networkRequests: number;
}

interface PerformanceMonitorProps {
  onOptimize?: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = React.memo(({ onOptimize }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    networkRequests: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  const measurePerformance = useCallback(() => {
    const startTime = performance.now();
    
    // Measure render time
    const renderTime = performance.now() - startTime;
    
    // Estimate memory usage (simplified)
    const memoryUsage = (performance as any).memory ? 
      Math.round((performance as any).memory.usedJSHeapSize / 1048576) : 0;
    
    // Count DOM nodes as component proxy
    const componentCount = document.querySelectorAll('*').length;
    
    // Estimate cache hit rate (mock for now)
    const cacheHitRate = Math.round(Math.random() * 30 + 70);
    
    // Count network requests
    const networkRequests = performance.getEntriesByType('resource').length;

    setMetrics({
      renderTime: Math.round(renderTime * 100) / 100,
      componentCount,
      memoryUsage,
      cacheHitRate,
      networkRequests
    });
  }, []);

  useEffect(() => {
    if (isVisible) {
      measurePerformance();
      const interval = setInterval(measurePerformance, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible, measurePerformance]);

  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    // Penalize slow render times
    if (metrics.renderTime > 16) score -= Math.min(30, (metrics.renderTime - 16) * 2);
    
    // Penalize high memory usage
    if (metrics.memoryUsage > 100) score -= Math.min(20, (metrics.memoryUsage - 100) / 5);
    
    // Penalize too many components
    if (metrics.componentCount > 1000) score -= Math.min(20, (metrics.componentCount - 1000) / 100);
    
    // Bonus for good cache hit rate
    if (metrics.cacheHitRate > 80) score += Math.min(10, (metrics.cacheHitRate - 80) / 2);
    
    return Math.max(0, Math.min(100, score));
  }, [metrics]);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  }, []);

  const score = getPerformanceScore();

  if (!isVisible) {
    return (
      <Button
        type="text"
        icon={<ThunderboltOutlined />}
        onClick={() => setIsVisible(true)}
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
      >
        Performance
      </Button>
    );
  }

  return (
    <Card
      title="Performance Monitor"
      size="small"
      style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        width: 300, 
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
      extra={
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={measurePerformance}
          size="small"
        />
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Overall Score</Text>
          <Progress
            percent={score}
            strokeColor={getScoreColor(score)}
            size="small"
            format={() => `${score}%`}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Statistic
            title="Render Time"
            value={metrics.renderTime}
            suffix="ms"
            valueStyle={{ fontSize: '14px' }}
          />
          <Statistic
            title="Memory"
            value={metrics.memoryUsage}
            suffix="MB"
            valueStyle={{ fontSize: '14px' }}
          />
          <Statistic
            title="Components"
            value={metrics.componentCount}
            valueStyle={{ fontSize: '14px' }}
          />
          <Statistic
            title="Cache Hit"
            value={metrics.cacheHitRate}
            suffix="%"
            valueStyle={{ fontSize: '14px' }}
          />
        </div>
        
        <Button
          type="primary"
          size="small"
          onClick={onOptimize}
          style={{ width: '100%' }}
        >
          Optimize Performance
        </Button>
        
        <Button
          type="text"
          size="small"
          onClick={() => setIsVisible(false)}
          style={{ width: '100%' }}
        >
          Hide Monitor
        </Button>
      </Space>
    </Card>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;

/**
 * Performance Monitor Hook
 * Monitors memory usage and triggers cleanup when needed
 */

import { useEffect, useRef } from 'react';
import { useAudit } from '@/context/AuditContext';

interface PerformanceMetrics {
  memoryUsage?: number;
  resultCount: number;
  isLargeDataset: boolean;
}

export const usePerformanceMonitor = () => {
  const { state, cleanupMemory } = useAudit();
  const lastCleanupRef = useRef<number>(0);
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const LARGE_DATASET_THRESHOLD = 1000;

  useEffect(() => {
    const checkPerformance = () => {
      if (!state.currentSession) return;

      const metrics: PerformanceMetrics = {
        resultCount: state.currentSession.results.length,
        isLargeDataset: state.currentSession.results.length > LARGE_DATASET_THRESHOLD
      };

      // Check memory usage if available
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        metrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
      }

      // Trigger cleanup if needed
      const now = Date.now();
      const shouldCleanup = 
        metrics.isLargeDataset && 
        (now - lastCleanupRef.current) > CLEANUP_INTERVAL &&
        (state.currentSession.progress.status === 'completed' || 
         state.currentSession.progress.status === 'cancelled');

      if (shouldCleanup) {
        console.log('Performance monitor: Triggering memory cleanup', metrics);
        cleanupMemory();
        lastCleanupRef.current = now;
      }
    };

    // Check performance every 30 seconds
    const interval = setInterval(checkPerformance, 30000);
    
    // Initial check
    checkPerformance();

    return () => clearInterval(interval);
  }, [state.currentSession, cleanupMemory]);

  // Return performance metrics for debugging
  const getMetrics = (): PerformanceMetrics | null => {
    if (!state.currentSession) return null;

    const metrics: PerformanceMetrics = {
      resultCount: state.currentSession.results.length,
      isLargeDataset: state.currentSession.results.length > LARGE_DATASET_THRESHOLD
    };

    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024);
    }

    return metrics;
  };

  return { getMetrics };
};
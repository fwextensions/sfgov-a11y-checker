/**
 * Performance Tests
 * Tests for performance optimizations and memory management
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';
import { useResultsFilter } from '@/hooks/useResultsFilter';
import { AuditResult, AuditType } from '@/types';

describe('Performance Optimizations', () => {
  describe('useDebounce', () => {
    it('should debounce value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      );

      expect(result.current).toBe('initial');

      // Change value multiple times quickly
      rerender({ value: 'change1', delay: 100 });
      rerender({ value: 'change2', delay: 100 });
      rerender({ value: 'final', delay: 100 });

      // Should still be initial value immediately
      expect(result.current).toBe('initial');

      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should now be the final value
      expect(result.current).toBe('final');
    });
  });

  describe('Large Dataset Handling', () => {
    it('should handle large result sets efficiently', () => {
      // Generate large dataset
      const largeResults: AuditResult[] = Array.from({ length: 1000 }, (_, i) => ({
        fullUrl: `https://example.com/page${i}`,
        type: AuditType.IMAGE_MISSING_ALT,
        details: `Missing alt text for image ${i}`,
        linkText: '',
        targetUrl: '',
        imageFilename: `image${i}.jpg`
      }));

      const startTime = performance.now();
      
      // This should complete quickly even with 1000 results
      const { result } = renderHook(() => useResultsFilter(largeResults));
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
      expect(result.current.filteredResults).toHaveLength(1000);
    });
  });
});
/**
 * Virtualized Results List Component
 * Efficiently renders large lists of audit results using virtual scrolling
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuditResult } from '@/types';

interface VirtualizedResultsListProps {
  results: AuditResult[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (result: AuditResult, index: number) => React.ReactNode;
}

export const VirtualizedResultsList: React.FC<VirtualizedResultsListProps> = ({
  results,
  itemHeight,
  containerHeight,
  renderItem
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, results.length);
    
    return {
      startIndex: start,
      endIndex: end,
      visibleItems: results.slice(start, end)
    };
  }, [scrollTop, itemHeight, containerHeight, results]);

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Reset scroll when results change
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [results]);

  const totalHeight = results.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((result, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(result, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
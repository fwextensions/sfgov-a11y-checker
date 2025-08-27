/**
 * useResultsFilter Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useResultsFilter } from '../useResultsFilter';
import { AuditResult, AuditType } from '@/types';

describe('useResultsFilter', () => {
  const mockResults: AuditResult[] = [
    {
      fullUrl: 'https://example.com/page1',
      type: AuditType.IMAGE_MISSING_ALT,
      details: 'Missing alt text',
      linkText: '',
      targetUrl: '/image1.jpg',
      imageFilename: 'image1.jpg'
    },
    {
      fullUrl: 'https://example.com/page2',
      type: AuditType.INACCESSIBLE_LINK,
      details: 'Vague link text',
      linkText: 'click here',
      targetUrl: '/page',
      imageFilename: ''
    },
    {
      fullUrl: 'https://test.com/page1',
      type: AuditType.PDF_LINK,
      details: '',
      linkText: 'Download PDF',
      targetUrl: '/document.pdf',
      imageFilename: ''
    },
    {
      fullUrl: 'https://example.com/page1',
      type: AuditType.IMAGE_WITH_ALT,
      details: 'alt="Good description"',
      linkText: '',
      targetUrl: '/image2.jpg',
      imageFilename: 'image2.jpg'
    }
  ];

  describe('Initial State', () => {
    it('should initialize with all available types selected', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      expect(result.current.availableTypes).toEqual([
        AuditType.IMAGE_MISSING_ALT,
        AuditType.IMAGE_WITH_ALT,
        AuditType.INACCESSIBLE_LINK,
        AuditType.PDF_LINK
      ]);
      
      expect(result.current.filters.auditTypes).toEqual(result.current.availableTypes);
    });

    it('should return all results when no filters are applied', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      expect(result.current.filteredResults).toHaveLength(4);
      expect(result.current.filteredCount).toBe(4);
      expect(result.current.totalResults).toBe(4);
    });

    it('should calculate correct summary statistics', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      expect(result.current.summary).toEqual({
        total: 4,
        errors: 2, // IMAGE_MISSING_ALT and INACCESSIBLE_LINK
        info: 2,   // PDF_LINK and IMAGE_WITH_ALT
        byType: {
          [AuditType.IMAGE_MISSING_ALT]: 1,
          [AuditType.INACCESSIBLE_LINK]: 1,
          [AuditType.PDF_LINK]: 1,
          [AuditType.IMAGE_WITH_ALT]: 1
        },
        uniqueUrls: 2 // example.com and test.com
      });
    });
  });

  describe('Type Filtering', () => {
    it('should filter results by audit type', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          auditTypes: [AuditType.IMAGE_MISSING_ALT]
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(1);
      expect(result.current.filteredResults[0].type).toBe(AuditType.IMAGE_MISSING_ALT);
    });

    it('should filter by multiple audit types', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          auditTypes: [AuditType.IMAGE_MISSING_ALT, AuditType.PDF_LINK]
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(2);
      expect(result.current.filteredResults.map(r => r.type)).toEqual([
        AuditType.IMAGE_MISSING_ALT,
        AuditType.PDF_LINK
      ]);
    });

    it('should return empty results when no types are selected', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          auditTypes: []
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(0);
    });
  });

  describe('Search Filtering', () => {
    it('should filter by URL', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          searchTerm: 'test.com'
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(1);
      expect(result.current.filteredResults[0].fullUrl).toContain('test.com');
    });

    it('should filter by details', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          searchTerm: 'vague'
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(1);
      expect(result.current.filteredResults[0].details).toContain('Vague');
    });

    it('should filter by link text', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          searchTerm: 'click here'
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(1);
      expect(result.current.filteredResults[0].linkText).toBe('click here');
    });

    it('should filter by target URL', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          searchTerm: 'document.pdf'
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(1);
      expect(result.current.filteredResults[0].targetUrl).toContain('document.pdf');
    });

    it('should filter by image filename', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          searchTerm: 'image1.jpg'
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(1);
      expect(result.current.filteredResults[0].imageFilename).toBe('image1.jpg');
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          searchTerm: 'EXAMPLE.COM'
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(3);
    });
  });

  describe('Errors Only Filter', () => {
    it('should filter to show only error types', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          showOnlyErrors: true
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(2);
      expect(result.current.filteredResults.map(r => r.type)).toEqual([
        AuditType.IMAGE_MISSING_ALT,
        AuditType.INACCESSIBLE_LINK
      ]);
    });

    it('should show all results when showOnlyErrors is false', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          showOnlyErrors: false
        });
      });
      
      expect(result.current.filteredResults).toHaveLength(4);
    });
  });

  describe('Sorting', () => {
    it('should sort by URL ascending', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          sortBy: 'url',
          sortDirection: 'asc'
        });
      });
      
      const urls = result.current.filteredResults.map(r => r.fullUrl);
      expect(urls[0]).toBe('https://example.com/page1');
      expect(urls[urls.length - 1]).toBe('https://test.com/page1');
    });

    it('should sort by URL descending', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          sortBy: 'url',
          sortDirection: 'desc'
        });
      });
      
      const urls = result.current.filteredResults.map(r => r.fullUrl);
      expect(urls[0]).toBe('https://test.com/page1');
      expect(urls[urls.length - 1]).toBe('https://example.com/page1');
    });

    it('should sort by type ascending', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          sortBy: 'type',
          sortDirection: 'asc'
        });
      });
      
      const types = result.current.filteredResults.map(r => r.type);
      expect(types[0]).toBe(AuditType.IMAGE_MISSING_ALT);
      expect(types[types.length - 1]).toBe(AuditType.PDF_LINK);
    });

    it('should maintain original order when sorting by order', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          sortBy: 'order',
          sortDirection: 'asc'
        });
      });
      
      expect(result.current.filteredResults[0]).toEqual(mockResults[0]);
      expect(result.current.filteredResults[1]).toEqual(mockResults[1]);
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters together', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          auditTypes: [AuditType.IMAGE_MISSING_ALT, AuditType.IMAGE_WITH_ALT],
          searchTerm: 'example.com',
          showOnlyErrors: true
        });
      });
      
      // Should only show IMAGE_MISSING_ALT from example.com (errors only)
      expect(result.current.filteredResults).toHaveLength(1);
      expect(result.current.filteredResults[0].type).toBe(AuditType.IMAGE_MISSING_ALT);
      expect(result.current.filteredResults[0].fullUrl).toContain('example.com');
    });
  });

  describe('Grouped Results', () => {
    it('should group filtered results by type', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      const grouped = result.current.groupedResults;
      
      expect(grouped[AuditType.IMAGE_MISSING_ALT]).toHaveLength(1);
      expect(grouped[AuditType.INACCESSIBLE_LINK]).toHaveLength(1);
      expect(grouped[AuditType.PDF_LINK]).toHaveLength(1);
      expect(grouped[AuditType.IMAGE_WITH_ALT]).toHaveLength(1);
    });

    it('should only include filtered results in groups', () => {
      const { result } = renderHook(() => useResultsFilter(mockResults));
      
      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          auditTypes: [AuditType.IMAGE_MISSING_ALT]
        });
      });
      
      const grouped = result.current.groupedResults;
      
      expect(Object.keys(grouped)).toEqual([AuditType.IMAGE_MISSING_ALT]);
      expect(grouped[AuditType.IMAGE_MISSING_ALT]).toHaveLength(1);
    });
  });

  describe('Empty Results', () => {
    it('should handle empty results array', () => {
      const { result } = renderHook(() => useResultsFilter([]));
      
      expect(result.current.filteredResults).toHaveLength(0);
      expect(result.current.availableTypes).toHaveLength(0);
      expect(result.current.summary.total).toBe(0);
    });
  });
});
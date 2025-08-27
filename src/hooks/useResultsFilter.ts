/**
 * Results Filter Hook
 * Manages filtering and sorting logic for audit results
 */

import { useState, useMemo } from 'react';
import { AuditResult, AuditType } from '@/types';
import { FilterOptions } from '@/components/ResultsFilter';
import { useDebounce } from './useDebounce';

export const useResultsFilter = (results: AuditResult[]) => {
  // Get available audit types from results
  const availableTypes = useMemo(() => {
    const types = new Set(results.map(result => result.type));
    return Array.from(types).sort();
  }, [results]);

  // Initialize filters with all types selected
  const [filters, setFilters] = useState<FilterOptions>({
    auditTypes: availableTypes,
    searchTerm: '',
    sortBy: 'order',
    sortDirection: 'asc',
    showOnlyErrors: false
  });

  // Update filters when available types change
  useMemo(() => {
    if (availableTypes.length > 0 && filters.auditTypes.length === 0) {
      setFilters(prev => ({ ...prev, auditTypes: [...availableTypes] }));
    }
  }, [availableTypes, filters.auditTypes.length]);

  // Debounce search term to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = results;

    // Filter by audit types
    if (filters.auditTypes.length > 0) {
      filtered = filtered.filter(result => 
        filters.auditTypes.includes(result.type)
      );
    }

    // Filter by search term (debounced)
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(result =>
        result.fullUrl.toLowerCase().includes(searchLower) ||
        result.details.toLowerCase().includes(searchLower) ||
        result.linkText.toLowerCase().includes(searchLower) ||
        result.targetUrl.toLowerCase().includes(searchLower) ||
        result.imageFilename.toLowerCase().includes(searchLower)
      );
    }

    // Filter errors only
    if (filters.showOnlyErrors) {
      // Define which types are considered "errors" vs "informational"
      const errorTypes: AuditType[] = [
        AuditType.IMAGE_MISSING_ALT,
        AuditType.INACCESSIBLE_LINK,
        AuditType.INACCESSIBLE_BUTTON,
        AuditType.HEADING_HIERARCHY
      ];
      filtered = filtered.filter(result => 
        errorTypes.includes(result.type)
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'url':
          comparison = a.fullUrl.localeCompare(b.fullUrl);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'order':
        default:
          // Maintain original order by using array index
          const aIndex = results.indexOf(a);
          const bIndex = results.indexOf(b);
          comparison = aIndex - bIndex;
          break;
      }

      return filters.sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [results, filters.auditTypes, debouncedSearchTerm, filters.showOnlyErrors, filters.sortBy, filters.sortDirection]);

  // Group results by type for display
  const groupedResults = useMemo(() => {
    const groups: { [key in AuditType]?: AuditResult[] } = {};
    
    filteredResults.forEach(result => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type]!.push(result);
    });

    return groups;
  }, [filteredResults]);

  // Get summary statistics
  const summary = useMemo(() => {
    const stats: { [key in AuditType]?: number } = {};
    
    results.forEach(result => {
      stats[result.type] = (stats[result.type] || 0) + 1;
    });

    const totalIssues = results.length;
    const errorTypes: AuditType[] = [
      AuditType.IMAGE_MISSING_ALT,
      AuditType.INACCESSIBLE_LINK,
      AuditType.INACCESSIBLE_BUTTON,
      AuditType.HEADING_HIERARCHY
    ];
    
    const errorCount = results.filter(result => 
      errorTypes.includes(result.type)
    ).length;

    const infoCount = totalIssues - errorCount;

    return {
      total: totalIssues,
      errors: errorCount,
      info: infoCount,
      byType: stats,
      uniqueUrls: new Set(results.map(r => r.fullUrl)).size
    };
  }, [results]);

  return {
    filters,
    setFilters,
    filteredResults,
    groupedResults,
    availableTypes,
    summary,
    totalResults: results.length,
    filteredCount: filteredResults.length
  };
};
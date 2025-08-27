/**
 * Results Display Component
 * Shows categorized accessibility issues with detailed information
 */

'use client';

import React, { useState } from 'react';
import { AuditResult, AuditType } from '@/types';
import { useAuditResults } from '@/context/AuditContext';
import { ResultsFilter } from './ResultsFilter';
import { useResultsFilter } from '@/hooks/useResultsFilter';
import { VirtualizedResultsList } from './VirtualizedResultsList';

// Empty interface is intentional - component uses context for all data
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ResultsDisplayProps {}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = () => {
  const results = useAuditResults();
  const [expandedCategories, setExpandedCategories] = useState<Set<AuditType>>(new Set());
  
  const {
    filters,
    setFilters,
    groupedResults,
    availableTypes,
    summary,
    totalResults,
    filteredCount
  } = useResultsFilter(results);

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Audit Results</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No results available. Start an audit to see accessibility issues.</p>
        </div>
      </div>
    );
  }

  // Convert grouped results to categories format
  const categories = Object.entries(groupedResults).map(([type, results]) => ({
    type: type as AuditType,
    count: results.length,
    results: results
  })).sort((a, b) => b.count - a.count);

  const toggleCategory = (type: AuditType) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (type: AuditType) => {
    switch (type) {
      case AuditType.IMAGE_MISSING_ALT:
        return '🖼️';
      case AuditType.IMAGE_WITH_ALT:
        return '✅';
      case AuditType.INACCESSIBLE_LINK:
        return '🔗';
      case AuditType.INACCESSIBLE_BUTTON:
        return '🔘';
      case AuditType.PDF_LINK:
        return '📄';
      case AuditType.OFFICE_LINK:
        return '📊';
      case AuditType.TABLE_INFO:
        return '📋';
      case AuditType.HEADING_HIERARCHY:
        return '📝';
      default:
        return '⚠️';
    }
  };

  const getCategoryColor = (type: AuditType) => {
    switch (type) {
      case AuditType.IMAGE_WITH_ALT:
      case AuditType.TABLE_INFO:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case AuditType.IMAGE_MISSING_ALT:
      case AuditType.INACCESSIBLE_LINK:
      case AuditType.INACCESSIBLE_BUTTON:
      case AuditType.HEADING_HIERARCHY:
        return 'bg-red-50 border-red-200 text-red-800';
      case AuditType.PDF_LINK:
      case AuditType.OFFICE_LINK:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Component */}
      <ResultsFilter
        filters={filters}
        onFiltersChange={setFilters}
        availableTypes={availableTypes}
        totalResults={totalResults}
        filteredResults={filteredCount}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Audit Results</h2>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Total Issues</p>
            <p className="text-2xl font-bold text-blue-800">{summary.total}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600">Errors</p>
            <p className="text-2xl font-bold text-red-800">{summary.errors}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">URLs Audited</p>
            <p className="text-2xl font-bold text-green-800">{summary.uniqueUrls}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600">Showing</p>
            <p className="text-2xl font-bold text-purple-800">{filteredCount}</p>
          </div>
        </div>   
   {/* Category List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.type} className={`border rounded-lg ${getCategoryColor(category.type)}`}>
            <button
              onClick={() => toggleCategory(category.type)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-opacity-80 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getCategoryIcon(category.type)}</span>
                <div>
                  <h3 className="font-medium">{category.type}</h3>
                  <p className="text-sm opacity-75">{category.count} issues found</p>
                </div>
              </div>
              <span className="text-lg">
                {expandedCategories.has(category.type) ? '▼' : '▶'}
              </span>
            </button>

            {expandedCategories.has(category.type) && (
              <div className="border-t border-current border-opacity-20">
                <div className="p-4">
                  {category.results.length > 50 ? (
                    // Use virtual scrolling for large result sets
                    <VirtualizedResultsList
                      results={category.results}
                      itemHeight={120}
                      containerHeight={400}
                      renderItem={(result, index) => (
                        <div className="bg-white bg-opacity-50 rounded-md p-3 mb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-800 mb-1">
                                {result.fullUrl}
                              </p>
                              {result.details && (
                                <p className="text-sm text-gray-600 mb-2">{result.details}</p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs">
                                {result.linkText && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Text: &quot;{result.linkText}&quot;
                                  </span>
                                )}
                                {result.targetUrl && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Target: {result.targetUrl}
                                  </span>
                                )}
                                {result.imageFilename && (
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    File: {result.imageFilename}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  ) : (
                    // Regular rendering for smaller result sets
                    <div className="space-y-3">
                      {category.results.map((result, index) => (
                        <div key={index} className="bg-white bg-opacity-50 rounded-md p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-800 mb-1">
                                {result.fullUrl}
                              </p>
                              {result.details && (
                                <p className="text-sm text-gray-600 mb-2">{result.details}</p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs">
                                {result.linkText && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Text: &quot;{result.linkText}&quot;
                                  </span>
                                )}
                                {result.targetUrl && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Target: {result.targetUrl}
                                  </span>
                                )}
                                {result.imageFilename && (
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    File: {result.imageFilename}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {categories.length === 0 && filteredCount === 0 && totalResults > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No results match your current filters.</p>
          <button
            onClick={() => setFilters({
              auditTypes: availableTypes,
              searchTerm: '',
              sortBy: 'order',
              sortDirection: 'asc',
              showOnlyErrors: false
            })}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Understanding Results</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Red categories</strong> indicate accessibility issues that need attention</li>
          <li>• <strong>Yellow categories</strong> are informational (documents that may need review)</li>
          <li>• <strong>Blue categories</strong> show positive findings or structural information</li>
          <li>• Click on any category to expand and see detailed results</li>
          <li>• Use the Export CSV button to download results for offline analysis</li>
          <li>• Use filters above to focus on specific types of issues or URLs</li>
        </ul>
      </div>
      </div>
    </div>
  );
};
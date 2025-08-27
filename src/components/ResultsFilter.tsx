/**
 * Results Filter Component
 * Provides filtering and sorting controls for audit results
 */

'use client';

import React, { useState } from 'react';
import { AuditType } from '@/types';

export interface FilterOptions {
  auditTypes: AuditType[];
  searchTerm: string;
  sortBy: 'url' | 'type' | 'order';
  sortDirection: 'asc' | 'desc';
  showOnlyErrors: boolean;
}

interface ResultsFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTypes: AuditType[];
  totalResults: number;
  filteredResults: number;
}

export const ResultsFilter: React.FC<ResultsFilterProps> = ({
  filters,
  onFiltersChange,
  availableTypes,
  totalResults,
  filteredResults
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeToggle = (type: AuditType) => {
    const newTypes = filters.auditTypes.includes(type)
      ? filters.auditTypes.filter(t => t !== type)
      : [...filters.auditTypes, type];
    
    onFiltersChange({ ...filters, auditTypes: newTypes });
  };

  const handleSelectAllTypes = () => {
    onFiltersChange({ ...filters, auditTypes: [...availableTypes] });
  };

  const handleDeselectAllTypes = () => {
    onFiltersChange({ ...filters, auditTypes: [] });
  };

  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm });
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    const sortDirection = filters.sortBy === sortBy && filters.sortDirection === 'asc' 
      ? 'desc' 
      : 'asc';
    onFiltersChange({ ...filters, sortBy, sortDirection });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      auditTypes: [...availableTypes],
      searchTerm: '',
      sortBy: 'order',
      sortDirection: 'asc',
      showOnlyErrors: false
    });
  };

  const hasActiveFilters = 
    filters.auditTypes.length !== availableTypes.length ||
    filters.searchTerm !== '' ||
    filters.showOnlyErrors ||
    filters.sortBy !== 'order' ||
    filters.sortDirection !== 'asc';

  const getSortIcon = (sortBy: FilterOptions['sortBy']) => {
    if (filters.sortBy !== sortBy) return '↕️';
    return filters.sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-800">Filter Results</h3>
          <span className="text-sm text-gray-600">
            Showing {filteredResults} of {totalResults} results
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search URLs or issue details..."
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 min-w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md">
          <input
            type="checkbox"
            checked={filters.showOnlyErrors}
            onChange={(e) => onFiltersChange({ ...filters, showOnlyErrors: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Errors only</span>
        </label>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* Issue Type Filters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Issue Types</h4>
              <div className="space-x-2">
                <button
                  onClick={handleSelectAllTypes}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAllTypes}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.auditTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="rounded"
                  />
                  <span className="text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSortChange('url')}
                className={`px-3 py-1 text-sm rounded-md border ${
                  filters.sortBy === 'url'
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                URL {getSortIcon('url')}
              </button>
              <button
                onClick={() => handleSortChange('type')}
                className={`px-3 py-1 text-sm rounded-md border ${
                  filters.sortBy === 'type'
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Issue Type {getSortIcon('type')}
              </button>
              <button
                onClick={() => handleSortChange('order')}
                className={`px-3 py-1 text-sm rounded-md border ${
                  filters.sortBy === 'order'
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Discovery Order {getSortIcon('order')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Search: "{filters.searchTerm}"
                <button
                  onClick={() => handleSearchChange('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.showOnlyErrors && (
              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Errors Only
                <button
                  onClick={() => onFiltersChange({ ...filters, showOnlyErrors: false })}
                  className="ml-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.auditTypes.length !== availableTypes.length && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {filters.auditTypes.length} of {availableTypes.length} types
                <button
                  onClick={handleSelectAllTypes}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.sortBy !== 'order' || filters.sortDirection !== 'asc') && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Sort: {filters.sortBy} {filters.sortDirection}
                <button
                  onClick={() => onFiltersChange({ ...filters, sortBy: 'order', sortDirection: 'asc' })}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
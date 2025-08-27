/**
 * Results Filter Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsFilter, FilterOptions } from '../ResultsFilter';
import { AuditType } from '@/types';

describe('ResultsFilter', () => {
  const mockAvailableTypes = [
    AuditType.IMAGE_MISSING_ALT,
    AuditType.INACCESSIBLE_LINK,
    AuditType.PDF_LINK
  ];

  const defaultFilters: FilterOptions = {
    auditTypes: mockAvailableTypes,
    searchTerm: '',
    sortBy: 'order',
    sortDirection: 'asc',
    showOnlyErrors: false
  };

  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  const renderComponent = (filters = defaultFilters) => {
    return render(
      <ResultsFilter
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        availableTypes={mockAvailableTypes}
        totalResults={100}
        filteredResults={75}
      />
    );
  };

  describe('Basic Rendering', () => {
    it('should render filter component with results count', () => {
      renderComponent();
      
      expect(screen.getByText('Filter Results')).toBeInTheDocument();
      expect(screen.getByText('Showing 75 of 100 results')).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText('Search URLs or issue details...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render errors only checkbox', () => {
      renderComponent();
      
      const errorsCheckbox = screen.getByLabelText('Errors only');
      expect(errorsCheckbox).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call onFiltersChange when search term changes', () => {
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText('Search URLs or issue details...');
      fireEvent.change(searchInput, { target: { value: 'example.com' } });
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        searchTerm: 'example.com'
      });
    });

    it('should display current search term', () => {
      const filtersWithSearch = {
        ...defaultFilters,
        searchTerm: 'test search'
      };
      
      renderComponent(filtersWithSearch);
      
      const searchInput = screen.getByDisplayValue('test search');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Errors Only Filter', () => {
    it('should call onFiltersChange when errors only is toggled', () => {
      renderComponent();
      
      const errorsCheckbox = screen.getByLabelText('Errors only');
      fireEvent.click(errorsCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        showOnlyErrors: true
      });
    });

    it('should show checked state when showOnlyErrors is true', () => {
      const filtersWithErrors = {
        ...defaultFilters,
        showOnlyErrors: true
      };
      
      renderComponent(filtersWithErrors);
      
      const errorsCheckbox = screen.getByLabelText('Errors only') as HTMLInputElement;
      expect(errorsCheckbox.checked).toBe(true);
    });
  });

  describe('Expanded Filters', () => {
    it('should show expanded filters when Show Filters is clicked', () => {
      renderComponent();
      
      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);
      
      expect(screen.getByText('Issue Types')).toBeInTheDocument();
      expect(screen.getByText('Sort By')).toBeInTheDocument();
    });

    it('should hide expanded filters when Hide Filters is clicked', () => {
      renderComponent();
      
      // First show filters
      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);
      
      // Then hide them
      const hideFiltersButton = screen.getByText('Hide Filters');
      fireEvent.click(hideFiltersButton);
      
      expect(screen.queryByText('Issue Types')).not.toBeInTheDocument();
    });
  });

  describe('Issue Type Filters', () => {
    beforeEach(() => {
      renderComponent();
      // Expand filters first
      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);
    });

    it('should render all available issue types as checkboxes', () => {
      mockAvailableTypes.forEach(type => {
        expect(screen.getByLabelText(type)).toBeInTheDocument();
      });
    });

    it('should call onFiltersChange when issue type is toggled', () => {
      const checkbox = screen.getByLabelText(AuditType.IMAGE_MISSING_ALT);
      fireEvent.click(checkbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        auditTypes: [AuditType.INACCESSIBLE_LINK, AuditType.PDF_LINK]
      });
    });

    it('should select all types when Select All is clicked', () => {
      // First deselect one type
      const checkbox = screen.getByLabelText(AuditType.IMAGE_MISSING_ALT);
      fireEvent.click(checkbox);
      mockOnFiltersChange.mockClear();
      
      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        auditTypes: mockAvailableTypes
      });
    });

    it('should deselect all types when Deselect All is clicked', () => {
      const deselectAllButton = screen.getByText('Deselect All');
      fireEvent.click(deselectAllButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        auditTypes: []
      });
    });
  });

  describe('Sort Options', () => {
    beforeEach(() => {
      renderComponent();
      // Expand filters first
      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);
    });

    it('should render sort buttons', () => {
      expect(screen.getByText(/URL/)).toBeInTheDocument();
      expect(screen.getByText(/Issue Type/)).toBeInTheDocument();
      expect(screen.getByText(/Discovery Order/)).toBeInTheDocument();
    });

    it('should call onFiltersChange when sort option is clicked', () => {
      const urlSortButton = screen.getByText(/URL/);
      fireEvent.click(urlSortButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sortBy: 'url',
        sortDirection: 'asc'
      });
    });

    it('should toggle sort direction when same sort option is clicked twice', () => {
      const urlSortButton = screen.getByText(/URL/);
      
      // First click - should set to asc
      fireEvent.click(urlSortButton);
      mockOnFiltersChange.mockClear();
      
      // Second click - should toggle to desc
      fireEvent.click(urlSortButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sortBy: 'url',
        sortDirection: 'desc'
      });
    });

    it('should show active sort option with different styling', () => {
      const filtersWithSort = {
        ...defaultFilters,
        sortBy: 'url' as const,
        sortDirection: 'asc' as const
      };
      
      render(
        <ResultsFilter
          filters={filtersWithSort}
          onFiltersChange={mockOnFiltersChange}
          availableTypes={mockAvailableTypes}
          totalResults={100}
          filteredResults={75}
        />
      );
      
      // Expand filters
      const showFiltersButton = screen.getByText('Show Filters');
      fireEvent.click(showFiltersButton);
      
      const urlSortButton = screen.getByText(/URL/);
      expect(urlSortButton).toHaveClass('bg-blue-100');
    });
  });

  describe('Clear Filters', () => {
    it('should show Clear Filters button when filters are active', () => {
      const filtersWithChanges = {
        ...defaultFilters,
        searchTerm: 'test',
        showOnlyErrors: true
      };
      
      renderComponent(filtersWithChanges);
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('should not show Clear Filters button when no filters are active', () => {
      renderComponent();
      
      expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
    });

    it('should call onFiltersChange with default values when Clear Filters is clicked', () => {
      const filtersWithChanges = {
        ...defaultFilters,
        searchTerm: 'test',
        showOnlyErrors: true,
        sortBy: 'url' as const
      };
      
      renderComponent(filtersWithChanges);
      
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        auditTypes: mockAvailableTypes,
        searchTerm: '',
        sortBy: 'order',
        sortDirection: 'asc',
        showOnlyErrors: false
      });
    });
  });

  describe('Active Filter Summary', () => {
    it('should show active filter tags when filters are applied', () => {
      const filtersWithChanges = {
        ...defaultFilters,
        searchTerm: 'example.com',
        showOnlyErrors: true,
        auditTypes: [AuditType.IMAGE_MISSING_ALT],
        sortBy: 'url' as const,
        sortDirection: 'desc' as const
      };
      
      renderComponent(filtersWithChanges);
      
      expect(screen.getByText('Search: "example.com"')).toBeInTheDocument();
      expect(screen.getByText('Errors Only')).toBeInTheDocument();
      expect(screen.getByText('1 of 3 types')).toBeInTheDocument();
      expect(screen.getByText('Sort: url desc')).toBeInTheDocument();
    });

    it('should allow removing individual filter tags', () => {
      const filtersWithSearch = {
        ...defaultFilters,
        searchTerm: 'example.com'
      };
      
      renderComponent(filtersWithSearch);
      
      const removeButton = screen.getByText('×');
      fireEvent.click(removeButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        searchTerm: ''
      });
    });
  });
});
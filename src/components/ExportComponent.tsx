/**
 * Export Component
 * Handles CSV export functionality with progress indication
 */

'use client';

import React, { useState } from 'react';
import { AuditResult } from '@/types';
import { CSVExporter } from '@/lib/csvExporter';

interface ExportComponentProps {
  results: AuditResult[];
  filename?: string;
  disabled?: boolean;
}

export const ExportComponent: React.FC<ExportComponentProps> = ({
  results,
  filename,
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Debug logging
  console.log('ExportComponent rendered with:', {
    resultsLength: results.length,
    disabled,
    filename
  });

  const handleExport = async () => {
    console.log('Export button clicked, results length:', results.length);
    console.log('Disabled:', disabled);
    
    if (results.length === 0 || disabled) {
      console.log('Export cancelled - no results or disabled');
      return;
    }

    setIsExporting(true);
    setExportComplete(false);

    try {
      console.log('Starting export...');
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Calling CSVExporter.exportResults with', results.length, 'results');
      CSVExporter.exportResults(results, filename);
      
      console.log('Export completed successfully');
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const stats = CSVExporter.getExportStats(results);

  if (results.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-500 text-center">
          No results available for export
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Export Results</h3>
        <button
          onClick={(e) => {
            console.log('Export button clicked!', e);
            handleExport();
          }}
          disabled={disabled || isExporting}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            disabled || isExporting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : exportComplete
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isExporting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </span>
          ) : exportComplete ? (
            <span className="flex items-center">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Exported!
            </span>
          ) : (
            'Download CSV'
          )}
        </button>
      </div>

      {/* Export Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Results</p>
          <p className="text-lg font-semibold text-gray-800">{stats.totalResults}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">URLs</p>
          <p className="text-lg font-semibold text-gray-800">{stats.uniqueUrls}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-lg font-semibold text-gray-800">{stats.categories}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">File Size</p>
          <p className="text-lg font-semibold text-gray-800">{stats.estimatedFileSize}</p>
        </div>
      </div>

      {/* Export Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• CSV file will be compatible with Excel and other spreadsheet applications</p>
        <p>• File includes all audit results with the same format as the original script</p>
        <p>• Download will start automatically when you click the button</p>
      </div>


    </div>
  );
};
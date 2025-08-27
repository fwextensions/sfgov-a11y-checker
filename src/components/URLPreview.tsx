'use client';

import React, { useState } from 'react';

interface URLPreviewProps {
  urls: string[];
  errors?: string[];
  onRemoveUrl?: (index: number) => void;
  onClearAll?: () => void;
}

export default function URLPreview({ urls, errors = [], onRemoveUrl, onClearAll }: URLPreviewProps) {
  const [showAll, setShowAll] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  
  const displayUrls = showAll ? urls : urls.slice(0, 10);
  const hasMoreUrls = urls.length > 10;

  if (urls.length === 0 && errors.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              URLs Detected
            </h3>
            <p className="text-sm text-gray-600">
              {urls.length} valid URL{urls.length !== 1 ? 's' : ''} found
              {errors.length > 0 && (
                <span className="text-red-600 ml-2">
                  ({errors.length} error{errors.length !== 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
          
          {urls.length > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* URL List */}
      {urls.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Valid URLs</h4>
          </div>
          
          <div className="divide-y divide-gray-200">
            {displayUrls.map((url, index) => (
              <div key={index} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate" title={url}>
                    {url}
                  </p>
                </div>
                
                {onRemoveUrl && (
                  <button
                    onClick={() => onRemoveUrl(index)}
                    className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove URL"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {hasMoreUrls && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showAll ? 'Show Less' : `Show ${urls.length - 10} More URLs`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-white border border-red-200 rounded-lg">
          <div className="px-4 py-3 border-b border-red-200 flex items-center justify-between">
            <h4 className="text-sm font-medium text-red-900">
              Parsing Errors ({errors.length})
            </h4>
            <button
              onClick={() => setShowErrors(!showErrors)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              {showErrors ? 'Hide' : 'Show'} Errors
            </button>
          </div>
          
          {showErrors && (
            <div className="px-4 py-3">
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example CSV Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900">Need help with CSV format?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Download an example CSV file to see the correct format.
            </p>
            <button
              onClick={() => {
                const csvContent = `URL,Description
https://example.com,Homepage
https://example.com/about,About page
https://example.com/contact,Contact page`;
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'example-urls.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Download Example CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
/**
 * Progress Tracker Component
 * Shows real-time progress updates during accessibility audits
 */

'use client';

import React from 'react';
import { ProgressState, AuditError } from '@/types';

interface ProgressTrackerProps {
  progress: ProgressState;
  startTime?: Date;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  startTime
}) => {
  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  const getElapsedTime = () => {
    if (!startTime) return '0s';
    
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    
    if (elapsed < 60) {
      return `${elapsed}s`;
    } else if (elapsed < 3600) {
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const getEstimatedTimeRemaining = () => {
    if (!startTime || progress.completed === 0 || progress.status !== 'running') {
      return 'Calculating...';
    }
    
    const elapsed = Date.now() - startTime.getTime();
    const avgTimePerUrl = elapsed / progress.completed;
    const remaining = progress.total - progress.completed;
    const estimatedMs = remaining * avgTimePerUrl;
    
    const estimatedSeconds = Math.floor(estimatedMs / 1000);
    
    if (estimatedSeconds < 60) {
      return `~${estimatedSeconds}s`;
    } else if (estimatedSeconds < 3600) {
      const minutes = Math.floor(estimatedSeconds / 60);
      return `~${minutes}m`;
    } else {
      const hours = Math.floor(estimatedSeconds / 3600);
      const minutes = Math.floor((estimatedSeconds % 3600) / 60);
      return `~${hours}h ${minutes}m`;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'running':
        return 'text-green-600';
      case 'paused':
        return 'text-yellow-600';
      case 'completed':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'running':
        return 'Running';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Idle';
    }
  };

  const shouldShowProgress = progress.status !== 'idle';

  if (!shouldShowProgress) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Audit Progress</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()} bg-gray-100`}>
          {getStatusText()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{progress.completed} of {progress.total} URLs processed</span>
          <span>{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              progress.status === 'completed' ? 'bg-green-500' :
              progress.status === 'cancelled' ? 'bg-red-500' :
              progress.status === 'paused' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Current URL and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Current URL</p>
          <p className="text-sm font-medium text-gray-800 truncate" title={progress.currentUrl}>
            {progress.currentUrl || 'None'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Elapsed Time</p>
          <p className="text-sm font-medium text-gray-800">{getElapsedTime()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Time Remaining</p>
          <p className="text-sm font-medium text-gray-800">{getEstimatedTimeRemaining()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Errors</p>
          <p className="text-sm font-medium text-red-600">{progress.errors.length}</p>
        </div>
      </div>

      {/* Error Log */}
      {progress.errors.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Recent Errors ({progress.errors.length})
          </h3>
          <div className="max-h-32 overflow-y-auto bg-red-50 rounded-md p-3">
            {progress.errors.slice(-5).map((error, index) => (
              <div key={index} className="text-xs text-red-700 mb-1 last:mb-0">
                <span className="font-medium">{error.url}:</span> {error.error}
                <span className="text-red-500 ml-2">
                  {error.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
            {progress.errors.length > 5 && (
              <div className="text-xs text-red-600 mt-2 font-medium">
                ... and {progress.errors.length - 5} more errors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Summary */}
      {progress.status === 'completed' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-sm font-medium text-green-800 mb-2">Audit Completed!</h3>
          <div className="text-sm text-green-700">
            <p>• Processed {progress.completed} URLs in {getElapsedTime()}</p>
            <p>• {progress.errors.length} errors encountered</p>
            <p>• Results are ready for review and export</p>
          </div>
        </div>
      )}

      {/* Cancellation Notice */}
      {progress.status === 'cancelled' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-800 mb-2">Audit Cancelled</h3>
          <div className="text-sm text-red-700">
            <p>• Processed {progress.completed} of {progress.total} URLs</p>
            <p>• Partial results are available for review</p>
          </div>
        </div>
      )}
    </div>
  );
};
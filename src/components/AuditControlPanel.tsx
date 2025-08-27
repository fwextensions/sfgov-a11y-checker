/**
 * Audit Control Panel Component
 * Provides configuration and control for accessibility audits
 */

'use client';

import React, { useState } from 'react';
import { AuditConfig } from '@/types';
import { Tooltip } from './HelpSystem';

interface AuditControlPanelProps {
  urls: string[];
  config: AuditConfig;
  onConfigChange: (config: AuditConfig) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  isRunning: boolean;
  isPaused: boolean;
  canStart: boolean;
}

export const AuditControlPanel: React.FC<AuditControlPanelProps> = ({
  urls,
  config,
  onConfigChange,
  onStart,
  onPause,
  onResume,
  onCancel,
  isRunning,
  isPaused,
  canStart
}) => {
  const [localConfig, setLocalConfig] = useState<AuditConfig>(config);

  const handleConfigChange = (field: keyof AuditConfig, value: number) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const getEstimatedTime = () => {
    if (urls.length === 0) return '0 seconds';
    
    const totalRequests = urls.length;
    const batchSize = localConfig.concurrentRequests;
    const batches = Math.ceil(totalRequests / batchSize);
    const delayTime = (batches - 1) * localConfig.delayBetweenRequests;
    const requestTime = batches * localConfig.timeoutDuration;
    const totalSeconds = Math.ceil((delayTime + requestTime) / 1000);
    
    if (totalSeconds < 60) {
      return `~${totalSeconds} seconds`;
    } else if (totalSeconds < 3600) {
      return `~${Math.ceil(totalSeconds / 60)} minutes`;
    } else {
      return `~${Math.ceil(totalSeconds / 3600)} hours`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Audit Configuration</h2>
      
      {/* URL Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">URLs to audit</p>
            <p className="text-2xl font-bold text-blue-600">{urls.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estimated time</p>
            <p className="text-lg font-semibold text-gray-800">{getEstimatedTime()}</p>
          </div>
        </div>
      </div>

      {/* Configuration Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="concurrent-requests" className="block text-sm font-medium text-gray-700 mb-2">
            Concurrent Requests
            <Tooltip content="Number of URLs to audit simultaneously. Higher values are faster but may overwhelm servers. Start with 2-3 for best results.">
              <span className="ml-1 text-gray-500 cursor-help">ⓘ</span>
            </Tooltip>
          </label>
          <input
            id="concurrent-requests"
            type="number"
            min="1"
            max="10"
            value={localConfig.concurrentRequests}
            onChange={(e) => handleConfigChange('concurrentRequests', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRunning}
          />
          <p className="text-xs text-gray-500 mt-1">Recommended: 2-5 for most servers</p>
        </div>

        <div>
          <label htmlFor="delay-between" className="block text-sm font-medium text-gray-700 mb-2">
            Delay Between Batches (ms)
            <span className="ml-1 text-gray-500" title="Delay between batches of requests">ⓘ</span>
          </label>
          <input
            id="delay-between"
            type="number"
            min="0"
            max="5000"
            step="100"
            value={localConfig.delayBetweenRequests}
            onChange={(e) => handleConfigChange('delayBetweenRequests', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRunning}
          />
          <p className="text-xs text-gray-500 mt-1">Higher values are more server-friendly</p>
        </div>

        <div>
          <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-2">
            Request Timeout (ms)
            <span className="ml-1 text-gray-500" title="Maximum time to wait for each request">ⓘ</span>
          </label>
          <input
            id="timeout"
            type="number"
            min="5000"
            max="30000"
            step="1000"
            value={localConfig.timeoutDuration}
            onChange={(e) => handleConfigChange('timeoutDuration', parseInt(e.target.value) || 10000)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRunning}
          />
          <p className="text-xs text-gray-500 mt-1">Recommended: 10-15 seconds</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        {!isRunning && !isPaused && (
          <button
            onClick={onStart}
            disabled={!canStart}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              canStart
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Audit
          </button>
        )}

        {isRunning && !isPaused && (
          <button
            onClick={onPause}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium transition-colors"
          >
            Pause Audit
          </button>
        )}

        {isPaused && (
          <button
            onClick={onResume}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Resume Audit
          </button>
        )}

        {(isRunning || isPaused) && (
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
          >
            Cancel Audit
          </button>
        )}
      </div>

      {/* Help Text */}
      {!canStart && urls.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Please upload a CSV file with URLs before starting an audit.
          </p>
        </div>
      )}

      {/* Rate Limiting Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Rate Limiting Guidelines</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Lower concurrent requests and higher delays are more respectful to target servers</li>
          <li>• For large audits (100+ URLs), consider using 2-3 concurrent requests with 1-2 second delays</li>
          <li>• The audit will automatically retry failed requests with exponential backoff</li>
          <li>• You can pause and resume the audit at any time</li>
        </ul>
      </div>
    </div>
  );
};
/**
 * Main Application Component
 * Integrates all components into a complete accessibility auditor interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import URLPreview from './URLPreview';
import { AuditControlPanel } from './AuditControlPanel';
import { ProgressTracker } from './ProgressTracker';
import { ResultsDisplay } from './ResultsDisplay';
import { ExportComponent } from './ExportComponent';
import { HelpButton, ExampleCSVDownload } from './HelpSystem';
import { useAudit, useAuditResults, useAuditProgress } from '@/context/AuditContext';
import { useAuditEngine } from '@/hooks/useAuditEngine';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

type AppSection = 'upload' | 'configure' | 'results';

export const AccessibilityAuditorApp: React.FC = () => {
  const { state, uploadUrls, updateConfig } = useAudit();
  const { start, pause, resume, cancel, isRunning, isPaused } = useAuditEngine();
  const results = useAuditResults();
  const progress = useAuditProgress();
  const [activeSection, setActiveSection] = useState<AppSection>('upload');
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);
  
  // Enable performance monitoring
  usePerformanceMonitor();

  // Automatically switch to results tab when audit completes
  useEffect(() => {
    if (progress?.status === 'completed' && results.length > 0) {
      // Show completion notification
      setShowCompletionNotification(true);
      
      // Add a delay to let the user see the completion status, then switch tabs
      const timer = setTimeout(() => {
        setActiveSection('results');
        setShowCompletionNotification(false);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [progress?.status, results.length]);

  const handleFileProcessed = (urls: string[]) => {
    uploadUrls(urls);
    setActiveSection('configure');
  };

  const handleStartAudit = () => {
    start(state.auditConfig);
  };

  const getStatusIndicator = () => {
    if (isRunning) return { text: 'Audit Running', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (isPaused) return { text: 'Audit Paused', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (results.length > 0) return { text: 'Audit Complete', color: 'text-green-600', bg: 'bg-green-100' };
    if (state.uploadedUrls.length > 0) return { text: 'Ready to Audit', color: 'text-purple-600', bg: 'bg-purple-100' };
    return { text: 'Upload CSV to Start', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const status = getStatusIndicator();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Web Accessibility Auditor
              </h1>
              <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                {status.text}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {state.uploadedUrls.length > 0 && (
                <span className="text-sm text-gray-500 hidden md:block">
                  {state.uploadedUrls.length} URLs loaded
                </span>
              )}
              <HelpButton variant="button" className="hidden sm:block" />
              <span className="text-xs text-gray-400 hidden lg:block">
                Powered by Next.js 15
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveSection('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              1. Upload CSV
            </button>
            <button
              onClick={() => setActiveSection('configure')}
              disabled={state.uploadedUrls.length === 0}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === 'configure' && state.uploadedUrls.length > 0
                  ? 'border-blue-500 text-blue-600'
                  : state.uploadedUrls.length === 0
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              2. Configure & Run
            </button>
            <button
              onClick={() => setActiveSection('results')}
              disabled={results.length === 0}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === 'results' && results.length > 0
                  ? 'border-blue-500 text-blue-600'
                  : results.length === 0
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              3. View Results
              {results.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {results.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          
          {/* Upload Section */}
          {activeSection === 'upload' && (
            <div className="space-y-6">
              {/* Introduction */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Welcome to the Web Accessibility Auditor
                  </h2>
                  <HelpButton section="overview" />
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Upload a CSV file containing URLs to perform comprehensive accessibility audits. 
                  The tool will analyze each website for common accessibility issues including missing alt text, 
                  vague link text, button labels, heading hierarchy, and document links.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">How It Works</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>This tool uses a server-side proxy to fetch and analyze websites, bypassing browser security restrictions.</p>
                        <p className="mt-1">Some websites may still be inaccessible due to their security policies or if they block automated requests.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-blue-800">CSV Format Requirements</h3>
                    <div className="flex items-center space-x-2">
                      <ExampleCSVDownload />
                      <HelpButton section="csv-format" />
                    </div>
                  </div>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                    <li>• First column should contain URLs (with or without headers)</li>
                    <li>• URLs should include the protocol (http:// or https://)</li>
                    <li>• One URL per row</li>
                    <li>• Additional columns will be ignored</li>
                  </ul>
                </div>
              </div>

              {/* File Upload Section */}
              <FileUpload 
                onFileProcessed={handleFileProcessed}
                onError={(error) => console.error('File upload error:', error)}
              />

              {/* URL Preview */}
              {state.uploadedUrls.length > 0 && (
                <URLPreview urls={state.uploadedUrls} />
              )}
            </div>
          )}

          {/* Configure Section */}
          {activeSection === 'configure' && (
            <div className="space-y-6">
              {/* URL Summary */}
              {state.uploadedUrls.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Ready to Audit {state.uploadedUrls.length} URLs
                    </h2>
                    <HelpButton section="overview" />
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base mb-4">
                    Configure your audit settings below and click &quot;Start Audit&quot; to begin the accessibility analysis.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveSection('upload')}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      ← Change CSV file
                    </button>
                    <HelpButton section="troubleshooting" variant="text" />
                  </div>
                </div>
              )}

              {/* Audit Control Panel */}
              {state.uploadedUrls.length > 0 && (
                <AuditControlPanel
                  urls={state.uploadedUrls}
                  config={state.auditConfig}
                  onConfigChange={updateConfig}
                  onStart={handleStartAudit}
                  onPause={pause}
                  onResume={resume}
                  onCancel={cancel}
                  isRunning={isRunning}
                  isPaused={isPaused}
                  canStart={state.uploadedUrls.length > 0 && !isRunning && !isPaused}
                />
              )}

              {/* Progress Tracker */}
              {progress && (
                <ProgressTracker 
                  progress={progress}
                  startTime={state.currentSession?.startTime}
                />
              )}
            </div>
          )}

          {/* Results Section */}
          {activeSection === 'results' && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        Audit Results
                      </h2>
                      <div className="flex items-center space-x-2">
                        <HelpButton section="audit-types" />
                        <HelpButton section="results" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Review the accessibility issues found across your {state.uploadedUrls.length} URLs.
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setActiveSection('configure')}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      ← Run New Audit
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Display */}
              {results.length > 0 && (
                <>
                  <ResultsDisplay />
                  
                  {/* Export Component */}
                  <ExportComponent 
                    results={results}
                    disabled={isRunning}
                  />
                </>
              )}
            </div>
          )}

          {/* Completion Notification */}
          {showCompletionNotification && (
            <div className="fixed top-20 right-4 max-w-sm z-50">
              <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Audit Complete!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Found {results.length} accessibility issues. Switching to results...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Global Progress Tracker (shown on all sections when running) */}
          {progress && (isRunning || isPaused) && activeSection !== 'configure' && (
            <div className="fixed bottom-4 right-4 max-w-sm z-40">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-800">Audit Progress</h3>
                  <button
                    onClick={() => setActiveSection('configure')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {progress.completed} of {progress.total} URLs
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-500">
              <p>Web Accessibility Auditor - Built with Next.js 15 and TypeScript</p>
              <p className="mt-1 text-xs text-gray-400">
                Version 1.0.0 • Helping make the web more accessible
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
              <a 
                href="https://www.w3.org/WAI/WCAG21/quickref/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                WCAG Guidelines
              </a>
              <a 
                href="https://webaim.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                WebAIM Resources
              </a>
              <a 
                href="https://developer.mozilla.org/en-US/docs/Web/Accessibility" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                MDN Accessibility
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
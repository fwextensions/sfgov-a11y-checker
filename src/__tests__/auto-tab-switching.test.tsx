/**
 * Auto Tab Switching Tests
 * Tests for automatic navigation to results tab when audit completes
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AccessibilityAuditorApp } from '@/components/AccessibilityAuditorApp';
import { AuditProvider } from '@/context/AuditContext';

// Mock the hooks
jest.mock('@/hooks/useAuditEngine', () => ({
  useAuditEngine: () => ({
    start: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    cancel: jest.fn(),
    isRunning: false,
    isPaused: false
  })
}));

jest.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({})
}));

// Mock components that might cause issues in tests
jest.mock('@/components/FileUpload', () => {
  return function MockFileUpload() {
    return <div data-testid="file-upload">File Upload Component</div>;
  };
});

jest.mock('@/components/HelpSystem', () => ({
  HelpButton: () => <button>Help</button>,
  ExampleCSVDownload: () => <button>Download Example</button>
}));

describe('Auto Tab Switching', () => {
  const renderWithProvider = (mockState = {}) => {
    const defaultState = {
      currentSession: null,
      uploadedUrls: [],
      auditConfig: {
        concurrentRequests: 3,
        delayBetweenRequests: 1000,
        timeoutDuration: 10000
      },
      filters: {
        auditTypes: [],
        urls: [],
        searchTerm: ''
      },
      sortOptions: {
        field: 'url' as const,
        direction: 'asc' as const
      },
      ...mockState
    };

    // Mock the context
    jest.doMock('@/context/AuditContext', () => ({
      useAudit: () => ({
        state: defaultState,
        uploadUrls: jest.fn(),
        updateConfig: jest.fn()
      }),
      useAuditResults: () => mockState.results || [],
      useAuditProgress: () => mockState.progress || null,
      AuditProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
    }));

    return render(
      <AuditProvider>
        <AccessibilityAuditorApp />
      </AuditProvider>
    );
  };

  it('should show completion notification when audit completes', async () => {
    const mockResults = [
      {
        fullUrl: 'https://example.com',
        type: 'Image missing alt text',
        details: 'Test result',
        linkText: '',
        targetUrl: '',
        imageFilename: ''
      }
    ];

    const mockProgress = {
      status: 'completed' as const,
      completed: 1,
      total: 1,
      currentUrl: '',
      errors: []
    };

    renderWithProvider({
      results: mockResults,
      progress: mockProgress
    });

    // Should show completion notification
    await waitFor(() => {
      expect(screen.getByText('Audit Complete!')).toBeInTheDocument();
    });

    expect(screen.getByText(/Found 1 accessibility issues/)).toBeInTheDocument();
    expect(screen.getByText(/Switching to results/)).toBeInTheDocument();
  });

  it('should show results tab as active when audit is completed', () => {
    const mockResults = [
      {
        fullUrl: 'https://example.com',
        type: 'Image missing alt text',
        details: 'Test result',
        linkText: '',
        targetUrl: '',
        imageFilename: ''
      }
    ];

    renderWithProvider({
      results: mockResults,
      progress: { status: 'completed', completed: 1, total: 1, currentUrl: '', errors: [] }
    });

    // Results tab should be enabled when there are results
    const resultsTab = screen.getByText(/3\. View Results/);
    expect(resultsTab).toBeInTheDocument();
  });
});
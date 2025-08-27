/**
 * Accessibility Auditor App Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessibilityAuditorApp } from '../AccessibilityAuditorApp';
import { AuditProvider } from '@/context/AuditContext';

// Mock the hooks and components
jest.mock('@/hooks/useAuditEngine', () => ({
  useAuditEngine: () => ({
    start: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    cancel: jest.fn(),
    isRunning: false,
    isPaused: false,
    canStart: true
  })
}));

jest.mock('../FileUpload', () => {
  return function MockFileUpload({ onFileProcessed }: any) {
    return (
      <div data-testid="file-upload">
        <button onClick={() => onFileProcessed(['https://example.com'])}>
          Mock Upload
        </button>
      </div>
    );
  };
});

jest.mock('../URLPreview', () => {
  return function MockURLPreview({ urls }: any) {
    return <div data-testid="url-preview">URLs: {urls.length}</div>;
  };
});

jest.mock('../AuditControlPanel', () => {
  return function MockAuditControlPanel(props: any) {
    return (
      <div data-testid="audit-control-panel">
        <button onClick={props.onStart}>Start Audit</button>
      </div>
    );
  };
});

jest.mock('../ProgressTracker', () => {
  return function MockProgressTracker() {
    return <div data-testid="progress-tracker">Progress</div>;
  };
});

jest.mock('../ResultsDisplay', () => {
  return function MockResultsDisplay() {
    return <div data-testid="results-display">Results</div>;
  };
});

jest.mock('../ExportComponent', () => {
  return function MockExportComponent() {
    return <div data-testid="export-component">Export</div>;
  };
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AuditProvider>
      {component}
    </AuditProvider>
  );
};

describe('AccessibilityAuditorApp', () => {
  describe('Initial Render', () => {
    it('should render the main application header', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      expect(screen.getByText('Web Accessibility Auditor')).toBeInTheDocument();
    });

    it('should render navigation tabs', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      expect(screen.getByText('1. Upload CSV')).toBeInTheDocument();
      expect(screen.getByText('2. Configure & Run')).toBeInTheDocument();
      expect(screen.getByText('3. View Results')).toBeInTheDocument();
    });

    it('should show upload section by default', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      expect(screen.getByText('Welcome to the Web Accessibility Auditor')).toBeInTheDocument();
      expect(screen.getByTestId('file-upload')).toBeInTheDocument();
    });

    it('should render footer with accessibility resources', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      expect(screen.getByText('WCAG Guidelines')).toBeInTheDocument();
      expect(screen.getByText('WebAIM Resources')).toBeInTheDocument();
      expect(screen.getByText('MDN Accessibility')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should start with upload tab active', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const uploadTab = screen.getByText('1. Upload CSV');
      expect(uploadTab).toHaveClass('border-blue-500', 'text-blue-600');
    });

    it('should disable configure tab when no URLs are uploaded', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const configureTab = screen.getByText('2. Configure & Run');
      expect(configureTab).toHaveClass('cursor-not-allowed');
      expect(configureTab).toBeDisabled();
    });

    it('should disable results tab when no results are available', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const resultsTab = screen.getByText('3. View Results');
      expect(resultsTab).toHaveClass('cursor-not-allowed');
      expect(resultsTab).toBeDisabled();
    });

    it('should allow navigation between active tabs', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      // Upload a file to enable configure tab
      const uploadButton = screen.getByText('Mock Upload');
      fireEvent.click(uploadButton);
      
      // Should automatically switch to configure section
      expect(screen.getByTestId('audit-control-panel')).toBeInTheDocument();
      
      // Should be able to navigate back to upload
      const uploadTab = screen.getByText('1. Upload CSV');
      fireEvent.click(uploadTab);
      
      expect(screen.getByText('Welcome to the Web Accessibility Auditor')).toBeInTheDocument();
    });
  });

  describe('File Upload Flow', () => {
    it('should show URL preview after file upload', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const uploadButton = screen.getByText('Mock Upload');
      fireEvent.click(uploadButton);
      
      expect(screen.getByTestId('url-preview')).toBeInTheDocument();
      expect(screen.getByText('URLs: 1')).toBeInTheDocument();
    });

    it('should automatically switch to configure section after upload', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const uploadButton = screen.getByText('Mock Upload');
      fireEvent.click(uploadButton);
      
      expect(screen.getByText('Ready to Audit 1 URLs')).toBeInTheDocument();
      expect(screen.getByTestId('audit-control-panel')).toBeInTheDocument();
    });

    it('should enable configure tab after file upload', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const uploadButton = screen.getByText('Mock Upload');
      fireEvent.click(uploadButton);
      
      const configureTab = screen.getByText('2. Configure & Run');
      expect(configureTab).not.toHaveClass('cursor-not-allowed');
      expect(configureTab).not.toBeDisabled();
    });
  });

  describe('Status Indicators', () => {
    it('should show upload status initially', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      expect(screen.getByText('Upload CSV to Start')).toBeInTheDocument();
    });

    it('should show ready status after file upload', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const uploadButton = screen.getByText('Mock Upload');
      fireEvent.click(uploadButton);
      
      expect(screen.getByText('Ready to Audit')).toBeInTheDocument();
    });

    it('should show URL count in header after upload', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const uploadButton = screen.getByText('Mock Upload');
      fireEvent.click(uploadButton);
      
      expect(screen.getByText('1 URLs loaded')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for mobile', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0');
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('should have responsive navigation tabs', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      const tabContainer = nav.querySelector('.overflow-x-auto');
      expect(tabContainer).toBeInTheDocument();
    });

    it('should have responsive footer layout', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });
  });

  describe('Section Content', () => {
    it('should show upload section content', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      expect(screen.getByText('CSV Format Requirements')).toBeInTheDocument();
      expect(screen.getByText('First column should contain URLs (with or without headers)')).toBeInTheDocument();
    });

    it('should show configure section content after upload', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const uploadButton = screen.getByText('Mock Upload');
      fireEvent.click(uploadButton);
      
      expect(screen.getByText('Configure your audit settings below')).toBeInTheDocument();
      expect(screen.getByText('← Change CSV file')).toBeInTheDocument();
    });

    it('should allow navigation back to upload from configure', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      // Upload file and go to configure
      const uploadButton = screen.getByText('Mock Upload');
      fireEvent.click(uploadButton);
      
      // Click back to upload
      const backButton = screen.getByText('← Change CSV file');
      fireEvent.click(backButton);
      
      expect(screen.getByText('Welcome to the Web Accessibility Auditor')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Web Accessibility Auditor');
      
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('Welcome to the Web Accessibility Auditor');
    });

    it('should have proper link attributes for external links', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const wcagLink = screen.getByText('WCAG Guidelines');
      expect(wcagLink).toHaveAttribute('target', '_blank');
      expect(wcagLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should have proper button states for disabled navigation', () => {
      renderWithProvider(<AccessibilityAuditorApp />);
      
      const configureTab = screen.getByText('2. Configure & Run');
      expect(configureTab).toBeDisabled();
      
      const resultsTab = screen.getByText('3. View Results');
      expect(resultsTab).toBeDisabled();
    });
  });
});
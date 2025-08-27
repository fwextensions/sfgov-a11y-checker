/**
 * Help System Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Tooltip, HelpButton, HelpModal, ExampleCSVDownload } from '../HelpSystem';

describe('HelpSystem Components', () => {
  describe('Tooltip', () => {
    it('should render children', () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Hover me</button>
        </Tooltip>
      );
      
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should show tooltip on hover', async () => {
      render(
        <Tooltip content="Test tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Test tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(button);
      
      await waitFor(() => {
        expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
      });
    });

    it('should show tooltip on focus', async () => {
      render(
        <Tooltip content="Test tooltip content">
          <button>Focus me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Focus me');
      fireEvent.focus(button);
      
      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on blur', async () => {
      render(
        <Tooltip content="Test tooltip content">
          <button>Focus me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Focus me');
      fireEvent.focus(button);
      
      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
      
      fireEvent.blur(button);
      
      await waitFor(() => {
        expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
      });
    });

    it('should apply custom className', () => {
      render(
        <Tooltip content="Test tooltip" className="custom-class">
          <button>Test</button>
        </Tooltip>
      );
      
      const container = screen.getByText('Test').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('HelpButton', () => {
    it('should render icon variant by default', () => {
      render(<HelpButton />);
      
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should render text variant', () => {
      render(<HelpButton variant="text" />);
      
      expect(screen.getByText('Help')).toBeInTheDocument();
    });

    it('should render button variant', () => {
      render(<HelpButton variant="button" />);
      
      expect(screen.getByText('Get Help')).toBeInTheDocument();
    });

    it('should open help modal when clicked', () => {
      render(<HelpButton />);
      
      const button = screen.getByText('?');
      fireEvent.click(button);
      
      expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<HelpButton className="custom-help-class" />);
      
      const button = screen.getByText('?');
      expect(button).toHaveClass('custom-help-class');
    });

    it('should have proper aria-label', () => {
      render(<HelpButton section="csv-format" />);
      
      const button = screen.getByLabelText('Get help about csv-format');
      expect(button).toBeInTheDocument();
    });
  });

  describe('HelpModal', () => {
    it('should not render when closed', () => {
      render(<HelpModal isOpen={false} onClose={() => {}} />);
      
      expect(screen.queryByText('Help & Documentation')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(<HelpModal isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(<HelpModal isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText('Close help modal');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should render navigation sidebar', () => {
      render(<HelpModal isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('CSV File Format')).toBeInTheDocument();
      expect(screen.getByText('Audit Types Explained')).toBeInTheDocument();
      expect(screen.getByText('Understanding Results')).toBeInTheDocument();
      expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
    });

    it('should show overview section by default', () => {
      render(<HelpModal isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText('How it works:')).toBeInTheDocument();
      expect(screen.getByText('What gets audited:')).toBeInTheDocument();
    });

    it('should switch sections when navigation is clicked', () => {
      render(<HelpModal isOpen={true} onClose={() => {}} />);
      
      const csvFormatButton = screen.getByText('CSV File Format');
      fireEvent.click(csvFormatButton);
      
      expect(screen.getByText('Requirements:')).toBeInTheDocument();
      expect(screen.getByText('Example CSV:')).toBeInTheDocument();
    });

    it('should start with specified section', () => {
      render(<HelpModal isOpen={true} onClose={() => {}} section="troubleshooting" />);
      
      expect(screen.getByText('Common Issues:')).toBeInTheDocument();
      expect(screen.getByText('CSV Upload Fails')).toBeInTheDocument();
    });

    it('should highlight active section in navigation', () => {
      render(<HelpModal isOpen={true} onClose={() => {}} section="csv-format" />);
      
      const csvFormatButton = screen.getByText('CSV File Format');
      expect(csvFormatButton).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });

  describe('ExampleCSVDownload', () => {
    // Mock URL.createObjectURL and related functions
    const mockCreateObjectURL = jest.fn();
    const mockRevokeObjectURL = jest.fn();
    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    beforeEach(() => {
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
      
      // Mock document.createElement
      const mockLink = {
        setAttribute: jest.fn(),
        click: mockClick,
        style: { visibility: '' }
      };
      
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
      
      mockCreateObjectURL.mockReturnValue('blob:mock-url');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render download link', () => {
      render(<ExampleCSVDownload />);
      
      expect(screen.getByText('Download Example CSV')).toBeInTheDocument();
    });

    it('should trigger download when clicked', () => {
      render(<ExampleCSVDownload />);
      
      const downloadButton = screen.getByText('Download Example CSV');
      fireEvent.click(downloadButton);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it('should create CSV with correct content', () => {
      render(<ExampleCSVDownload />);
      
      const downloadButton = screen.getByText('Download Example CSV');
      fireEvent.click(downloadButton);
      
      // Check that Blob was created with CSV content
      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text/csv;charset=utf-8;'
        })
      );
    });

    it('should set correct download filename', () => {
      render(<ExampleCSVDownload />);
      
      const downloadButton = screen.getByText('Download Example CSV');
      fireEvent.click(downloadButton);
      
      const mockLink = document.createElement('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'example-urls.csv');
    });
  });

  describe('Integration', () => {
    it('should work together - help button opens modal with correct section', () => {
      render(<HelpButton section="audit-types" />);
      
      const button = screen.getByText('?');
      fireEvent.click(button);
      
      // Modal should open with audit-types section
      expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
      expect(screen.getByText('Critical Issues (Red)')).toBeInTheDocument();
    });

    it('should close modal and maintain state', () => {
      render(<HelpButton section="results" />);
      
      // Open modal
      const button = screen.getByText('?');
      fireEvent.click(button);
      
      expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
      
      // Close modal
      const closeButton = screen.getByLabelText('Close help modal');
      fireEvent.click(closeButton);
      
      expect(screen.queryByText('Help & Documentation')).not.toBeInTheDocument();
      
      // Button should still be there
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });
});
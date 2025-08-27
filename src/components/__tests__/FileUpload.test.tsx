import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from '../FileUpload';

// Mock file for testing
const createMockFile = (content: string, filename: string = 'test.csv', type: string = 'text/csv') => {
  const file = new File([content], filename, { type });
  return file;
};

describe('FileUpload Component', () => {
  const mockOnFileProcessed = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    mockOnFileProcessed.mockClear();
    mockOnError.mockClear();
  });

  it('renders upload interface correctly', () => {
    render(
      <FileUpload 
        onFileProcessed={mockOnFileProcessed} 
        onError={mockOnError} 
      />
    );

    expect(screen.getByText(/Drop your CSV file here or click to browse/)).toBeInTheDocument();
    expect(screen.getByText(/CSV Format Requirements/)).toBeInTheDocument();
  });

  it('shows drag over state when file is dragged over', () => {
    render(
      <FileUpload 
        onFileProcessed={mockOnFileProcessed} 
        onError={mockOnError} 
      />
    );

    const dropZone = screen.getByText(/Drop your CSV file here or click to browse/).closest('div');
    
    fireEvent.dragOver(dropZone!);
    expect(screen.getByText(/Drop your CSV file here$/)).toBeInTheDocument();
  });

  it('processes valid CSV file correctly', async () => {
    const csvContent = 'URL\\nhttps://example.com\\nhttps://test.com';
    const file = createMockFile(csvContent);

    render(
      <FileUpload 
        onFileProcessed={mockOnFileProcessed} 
        onError={mockOnError} 
      />
    );

    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockOnFileProcessed).toHaveBeenCalledWith(['https://example.com', 'https://test.com']);
    });
  });

  it('handles file validation errors', async () => {
    const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB file
    const file = createMockFile(largeContent);

    render(
      <FileUpload 
        onFileProcessed={mockOnFileProcessed} 
        onError={mockOnError} 
      />
    );

    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('exceeds maximum allowed size'));
    });
  });

  it('handles empty CSV file', async () => {
    const file = createMockFile('');

    render(
      <FileUpload 
        onFileProcessed={mockOnFileProcessed} 
        onError={mockOnError} 
      />
    );

    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('CSV file is empty');
    });
  });
});
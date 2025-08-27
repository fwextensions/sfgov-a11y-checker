/**
 * Unit tests for AuditControlPanel component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditControlPanel } from '../AuditControlPanel';
import { AuditConfig } from '@/types';

describe('AuditControlPanel', () => {
  const defaultConfig: AuditConfig = {
    concurrentRequests: 3,
    delayBetweenRequests: 1000,
    timeoutDuration: 10000
  };

  const defaultProps = {
    urls: ['https://example.com', 'https://test.com'],
    config: defaultConfig,
    onConfigChange: jest.fn(),
    onStart: jest.fn(),
    onPause: jest.fn(),
    onResume: jest.fn(),
    onCancel: jest.fn(),
    isRunning: false,
    isPaused: false,
    canStart: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders audit configuration form', () => {
    render(<AuditControlPanel {...defaultProps} />);
    
    expect(screen.getByText('Audit Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/Concurrent Requests/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Delay Between Batches/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Request Timeout/)).toBeInTheDocument();
  });

  it('displays URL count and estimated time', () => {
    render(<AuditControlPanel {...defaultProps} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // URL count
    expect(screen.getByText(/URLs to audit/)).toBeInTheDocument();
    expect(screen.getByText(/Estimated time/)).toBeInTheDocument();
  });

  it('shows start button when not running', () => {
    render(<AuditControlPanel {...defaultProps} />);
    
    expect(screen.getByText('Start Audit')).toBeInTheDocument();
    expect(screen.queryByText('Pause Audit')).not.toBeInTheDocument();
  });

  it('shows pause button when running', () => {
    render(<AuditControlPanel {...defaultProps} isRunning={true} />);
    
    expect(screen.getByText('Pause Audit')).toBeInTheDocument();
    expect(screen.getByText('Cancel Audit')).toBeInTheDocument();
    expect(screen.queryByText('Start Audit')).not.toBeInTheDocument();
  });

  it('shows resume button when paused', () => {
    render(<AuditControlPanel {...defaultProps} isPaused={true} />);
    
    expect(screen.getByText('Resume Audit')).toBeInTheDocument();
    expect(screen.getByText('Cancel Audit')).toBeInTheDocument();
    expect(screen.queryByText('Start Audit')).not.toBeInTheDocument();
  });

  it('calls onStart when start button is clicked', () => {
    render(<AuditControlPanel {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Start Audit'));
    expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
  });

  it('calls onPause when pause button is clicked', () => {
    render(<AuditControlPanel {...defaultProps} isRunning={true} />);
    
    fireEvent.click(screen.getByText('Pause Audit'));
    expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
  });

  it('calls onResume when resume button is clicked', () => {
    render(<AuditControlPanel {...defaultProps} isPaused={true} />);
    
    fireEvent.click(screen.getByText('Resume Audit'));
    expect(defaultProps.onResume).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<AuditControlPanel {...defaultProps} isRunning={true} />);
    
    fireEvent.click(screen.getByText('Cancel Audit'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('updates config when input values change', () => {
    render(<AuditControlPanel {...defaultProps} />);
    
    const concurrentInput = screen.getByLabelText(/Concurrent Requests/);
    fireEvent.change(concurrentInput, { target: { value: '5' } });
    
    expect(defaultProps.onConfigChange).toHaveBeenCalledWith({
      ...defaultConfig,
      concurrentRequests: 5
    });
  });

  it('disables inputs when audit is running', () => {
    render(<AuditControlPanel {...defaultProps} isRunning={true} />);
    
    const concurrentInput = screen.getByLabelText(/Concurrent Requests/);
    const delayInput = screen.getByLabelText(/Delay Between Batches/);
    const timeoutInput = screen.getByLabelText(/Request Timeout/);
    
    expect(concurrentInput).toBeDisabled();
    expect(delayInput).toBeDisabled();
    expect(timeoutInput).toBeDisabled();
  });

  it('disables start button when canStart is false', () => {
    render(<AuditControlPanel {...defaultProps} canStart={false} />);
    
    const startButton = screen.getByText('Start Audit');
    expect(startButton).toBeDisabled();
  });

  it('shows help message when no URLs are available', () => {
    render(<AuditControlPanel {...defaultProps} urls={[]} canStart={false} />);
    
    expect(screen.getByText(/Please upload a CSV file/)).toBeInTheDocument();
  });

  it('calculates estimated time correctly', () => {
    const manyUrls = Array.from({ length: 100 }, (_, i) => `https://example${i}.com`);
    render(<AuditControlPanel {...defaultProps} urls={manyUrls} />);
    
    // Should show estimated time in minutes for large URL lists
    expect(screen.getByText(/minutes/)).toBeInTheDocument();
  });

  it('validates input ranges', () => {
    render(<AuditControlPanel {...defaultProps} />);
    
    const concurrentInput = screen.getByLabelText(/Concurrent Requests/) as HTMLInputElement;
    const delayInput = screen.getByLabelText(/Delay Between Batches/) as HTMLInputElement;
    const timeoutInput = screen.getByLabelText(/Request Timeout/) as HTMLInputElement;
    
    expect(concurrentInput.min).toBe('1');
    expect(concurrentInput.max).toBe('10');
    expect(delayInput.min).toBe('0');
    expect(delayInput.max).toBe('5000');
    expect(timeoutInput.min).toBe('5000');
    expect(timeoutInput.max).toBe('30000');
  });
});
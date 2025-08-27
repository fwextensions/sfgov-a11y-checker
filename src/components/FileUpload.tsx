'use client';

import React, { useState, useCallback, useRef } from 'react';
import { FileUploadProps, FileValidationResult } from '@/types';
import { AUDIT_CONSTANTS } from '@/types';

export default function FileUpload({ onFileProcessed, onError }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): FileValidationResult => {
    // Check file size
    if (file.size > AUDIT_CONSTANTS.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${AUDIT_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB`,
        size: file.size,
        type: file.type
      };
    }

    // Check file type
    const isValidType = (AUDIT_CONSTANTS.SUPPORTED_FILE_TYPES as readonly string[]).includes(file.type) || 
                       file.name.toLowerCase().endsWith('.csv');
    
    if (!isValidType) {
      return {
        isValid: false,
        error: `File type "${file.type}" is not supported. Please upload a CSV file.`,
        size: file.size,
        type: file.type
      };
    }

    return {
      isValid: true,
      size: file.size,
      type: file.type
    };
  };

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadStatus('idle');

    try {
      const validation = validateFile(file);
      if (!validation.isValid) {
        onError(validation.error || 'Invalid file');
        setUploadStatus('error');
        return;
      }

      const text = await file.text();
      const { CSVParser } = await import('@/lib/csvParser');
      const parseResult = await CSVParser.parseCSV(text);

      if (parseResult.urls.length === 0) {
        const errorMsg = parseResult.errors.length > 0 
          ? `No valid URLs found. Errors: ${parseResult.errors.slice(0, 3).join(', ')}`
          : 'No URLs found in CSV file';
        onError(errorMsg);
        setUploadStatus('error');
        return;
      }

      // Report parsing errors as warnings but still proceed if we have valid URLs
      if (parseResult.errors.length > 0) {
        console.warn('CSV parsing warnings:', parseResult.errors);
      }

      onFileProcessed(parseResult.urls);
      setUploadStatus('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      onError(errorMessage);
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    if (isProcessing) {
      return (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      );
    }
    
    switch (uploadStatus) {
      case 'success':
        return (
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    if (isProcessing) return 'Processing file...';
    
    switch (uploadStatus) {
      case 'success': return 'File uploaded successfully!';
      case 'error': return 'Upload failed. Please try again.';
      default: return isDragOver ? 'Drop your CSV file here' : 'Drop your CSV file here or click to browse';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${getStatusColor()}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,application/vnd.ms-excel"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {getStatusText()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              CSV files up to {AUDIT_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">CSV Format Requirements:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>First column should contain URLs</li>
          <li>Header row is optional</li>
          <li>One URL per row</li>
          <li>URLs should include protocol (http:// or https://)</li>
        </ul>
      </div>
    </div>
  );
}
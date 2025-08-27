/**
 * CSV processing types for the Web Accessibility Auditor
 */

export interface CSVParseResult {
  urls: string[];
  errors: string[];
  totalRows: number;
  validUrls: number;
}

export interface CSVExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  delimiter?: string;
}

export interface URLValidationResult {
  url: string;
  isValid: boolean;
  error?: string;
}

export interface CSVRow {
  [key: string]: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  size?: number;
  type?: string;
}
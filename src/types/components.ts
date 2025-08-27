/**
 * Component prop types for the Web Accessibility Auditor
 */

import { AuditResult, AuditConfig, ProgressState, AuditError } from './audit';
import { FilterOptions, SortOption } from './state';

export interface FileUploadProps {
  onFileProcessed: (urls: string[]) => void;
  onError: (error: string) => void;
}

export interface AuditControlProps {
  urls: string[];
  config: AuditConfig;
  onConfigChange: (config: AuditConfig) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export interface ProgressTrackerProps {
  progress: ProgressState;
  errors: AuditError[];
}

export interface ResultsDisplayProps {
  results: AuditResult[];
  onFilter: (filters: FilterOptions) => void;
  onSort: (sortBy: SortOption) => void;
  filters: FilterOptions;
  sortOptions: SortOption;
}

export interface ExportProps {
  results: AuditResult[];
  filename?: string;
  disabled?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface HTMLProcessorInterface {
  parseHTML(htmlString: string): Document;
  extractElements(document: Document, selectors: string[]): Element[];
  analyzeElement(element: Element): any;
}

export interface RateLimiterInterface {
  maxConcurrent: number;
  delayBetweenRequests: number;
  backoffMultiplier: number;
  maxRetries: number;
  
  schedule<T>(request: () => Promise<T>): Promise<T>;
  pause(): void;
  resume(): void;
  cancel(): void;
}
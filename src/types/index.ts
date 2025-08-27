/**
 * Main types export file for the Web Accessibility Auditor
 */

// Audit types
export * from './audit';

// State management types
export * from './state';

// Component types
export * from './components';

// CSV processing types
export * from './csv';

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
export type EventHandler<T = Event> = (event: T) => void;

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

// Constants
export const AUDIT_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_CONCURRENT_REQUESTS: 10,
  MIN_DELAY_BETWEEN_REQUESTS: 100,
  MAX_DELAY_BETWEEN_REQUESTS: 5000,
  DEFAULT_TIMEOUT: 10000,
  SUPPORTED_FILE_TYPES: ['text/csv', 'application/vnd.ms-excel'],
  TRIGGER_PHRASES: ['click here', 'read more', 'learn more', 'go here', 'see more', 'click', 'details', 'see details', 'more', 'see all', 'view all'],
  EXCLUDED_PHRASES: ['learn more about us'],
  OFFICE_EXTENSIONS: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  VALID_TLDS: ['.com', '.org', '.net', '.gov', '.edu', '.info', '.io', '.co', '.us', '.ca']
} as const;
/**
 * Core audit types and interfaces for the Web Accessibility Auditor
 */

export enum AuditType {
  IMAGE_MISSING_ALT = 'Image missing alt text',
  IMAGE_WITH_ALT = 'Image with alt text',
  INACCESSIBLE_LINK = 'Inaccessible Link',
  INACCESSIBLE_BUTTON = 'Inaccessible Button',
  PDF_LINK = 'PDF Link',
  OFFICE_LINK = 'Office File Link',
  TABLE_INFO = 'Table Info',
  HEADING_HIERARCHY = 'Heading hierarchy issue'
}

export interface AuditResult {
  fullUrl: string;
  type: AuditType;
  details: string;
  linkText: string;
  targetUrl: string;
  imageFilename: string;
}

export interface AuditError {
  url: string;
  error: string;
  timestamp: Date;
}

export interface AuditConfig {
  concurrentRequests: number;
  delayBetweenRequests: number;
  timeoutDuration: number;
}

export interface ProgressState {
  currentUrl: string;
  completed: number;
  total: number;
  errors: AuditError[];
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';
}

export interface AuditSession {
  id: string;
  urls: string[];
  config: AuditConfig;
  results: AuditResult[];
  errors: AuditError[];
  progress: ProgressState;
  startTime: Date;
  endTime?: Date;
}

export interface BaseAuditor {
  auditType: AuditType;
  audit(url: string, signal: AbortSignal): Promise<AuditResult[]>;
}
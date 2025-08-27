/**
 * State management types for the Web Accessibility Auditor
 */

import { AuditSession, AuditConfig, AuditResult, AuditError, ProgressState } from './audit';

export interface FilterOptions {
  auditTypes: string[];
  urls: string[];
  searchTerm: string;
}

export interface SortOption {
  field: 'url' | 'type' | 'timestamp';
  direction: 'asc' | 'desc';
}

export interface AppState {
  currentSession: AuditSession | null;
  uploadedUrls: string[];
  auditConfig: AuditConfig;
  filters: FilterOptions;
  sortOptions: SortOption;
}

export type AppAction = 
  | { type: 'UPLOAD_URLS'; payload: string[] }
  | { type: 'UPDATE_CONFIG'; payload: AuditConfig }
  | { type: 'START_AUDIT'; payload: AuditConfig }
  | { type: 'UPDATE_PROGRESS'; payload: Partial<ProgressState> }
  | { type: 'ADD_RESULTS'; payload: AuditResult[] }
  | { type: 'ADD_ERROR'; payload: AuditError }
  | { type: 'PAUSE_AUDIT' }
  | { type: 'RESUME_AUDIT' }
  | { type: 'CANCEL_AUDIT' }
  | { type: 'COMPLETE_AUDIT' }
  | { type: 'SET_FILTERS'; payload: FilterOptions }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'RESET_SESSION' }
  | { type: 'CLEANUP_MEMORY' };

export const initialAppState: AppState = {
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
    field: 'url',
    direction: 'asc'
  }
};
/**
 * Audit Context for state management
 * Provides centralized state management for the accessibility auditor
 */

'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, initialAppState, FilterOptions, SortOption } from '@/types/state';
import { AuditSession, AuditConfig, AuditResult, AuditError, ProgressState } from '@/types/audit';

interface AuditContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  uploadUrls: (urls: string[]) => void;
  updateConfig: (config: AuditConfig) => void;
  startAudit: (config: AuditConfig) => void;
  updateProgress: (progress: Partial<ProgressState>) => void;
  addResults: (results: AuditResult[]) => void;
  addError: (error: AuditError) => void;
  pauseAudit: () => void;
  resumeAudit: () => void;
  cancelAudit: () => void;
  completeAudit: () => void;
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortOption) => void;
  resetSession: () => void;
  cleanupMemory: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

/**
 * Reducer function for audit state management
 */
function auditReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPLOAD_URLS':
      return {
        ...state,
        uploadedUrls: action.payload,
        currentSession: null // Reset session when new URLs are uploaded
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        auditConfig: action.payload
      };

    case 'START_AUDIT':
      const newSession: AuditSession = {
        id: generateSessionId(),
        urls: state.uploadedUrls,
        config: action.payload,
        results: [],
        errors: [],
        progress: {
          currentUrl: '',
          completed: 0,
          total: state.uploadedUrls.length,
          errors: [],
          status: 'running'
        },
        startTime: new Date()
      };
      return {
        ...state,
        auditConfig: action.payload,
        currentSession: newSession
      };

    case 'UPDATE_PROGRESS':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          progress: {
            ...state.currentSession.progress,
            ...action.payload
          }
        }
      };

    case 'ADD_RESULTS':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          results: [...state.currentSession.results, ...action.payload]
        }
      };

    case 'ADD_ERROR':
      if (!state.currentSession) return state;
      const updatedErrors = [...state.currentSession.errors, action.payload];
      const updatedProgressErrors = [...state.currentSession.progress.errors, action.payload];
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          errors: updatedErrors,
          progress: {
            ...state.currentSession.progress,
            errors: updatedProgressErrors
          }
        }
      };

    case 'PAUSE_AUDIT':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          progress: {
            ...state.currentSession.progress,
            status: 'paused'
          }
        }
      };

    case 'RESUME_AUDIT':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          progress: {
            ...state.currentSession.progress,
            status: 'running'
          }
        }
      };

    case 'CANCEL_AUDIT':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          progress: {
            ...state.currentSession.progress,
            status: 'cancelled'
          },
          endTime: new Date()
        }
      };

    case 'COMPLETE_AUDIT':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          progress: {
            ...state.currentSession.progress,
            status: 'completed'
          },
          endTime: new Date()
        }
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload
      };

    case 'SET_SORT':
      return {
        ...state,
        sortOptions: action.payload
      };

    case 'RESET_SESSION':
      return {
        ...state,
        currentSession: null,
        uploadedUrls: []
      };

    case 'CLEANUP_MEMORY':
      // Clean up completed sessions and large result sets to free memory
      if (!state.currentSession) return state;
      
      const isCompleted = state.currentSession.progress.status === 'completed' || 
                         state.currentSession.progress.status === 'cancelled';
      
      if (isCompleted && state.currentSession.results.length > 1000) {
        // Keep only the most recent 500 results for very large datasets
        const recentResults = state.currentSession.results.slice(-500);
        return {
          ...state,
          currentSession: {
            ...state.currentSession,
            results: recentResults
          }
        };
      }
      
      return state;

    default:
      return state;
  }
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Audit Context Provider
 */
interface AuditProviderProps {
  children: ReactNode;
}

export const AuditProvider: React.FC<AuditProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(auditReducer, initialAppState);

  // Helper functions for common actions
  const uploadUrls = (urls: string[]) => {
    dispatch({ type: 'UPLOAD_URLS', payload: urls });
  };

  const updateConfig = (config: AuditConfig) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  };

  const startAudit = (config: AuditConfig) => {
    dispatch({ type: 'START_AUDIT', payload: config });
  };

  const updateProgress = (progress: Partial<ProgressState>) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
  };

  const addResults = (results: AuditResult[]) => {
    dispatch({ type: 'ADD_RESULTS', payload: results });
  };

  const addError = (error: AuditError) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  };

  const pauseAudit = () => {
    dispatch({ type: 'PAUSE_AUDIT' });
  };

  const resumeAudit = () => {
    dispatch({ type: 'RESUME_AUDIT' });
  };

  const cancelAudit = () => {
    dispatch({ type: 'CANCEL_AUDIT' });
  };

  const completeAudit = () => {
    dispatch({ type: 'COMPLETE_AUDIT' });
  };

  const setFilters = (filters: FilterOptions) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSort = (sort: SortOption) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  };

  const resetSession = () => {
    dispatch({ type: 'RESET_SESSION' });
  };

  const cleanupMemory = () => {
    dispatch({ type: 'CLEANUP_MEMORY' });
  };

  const contextValue: AuditContextType = {
    state,
    dispatch,
    uploadUrls,
    updateConfig,
    startAudit,
    updateProgress,
    addResults,
    addError,
    pauseAudit,
    resumeAudit,
    cancelAudit,
    completeAudit,
    setFilters,
    setSort,
    resetSession,
    cleanupMemory
  };

  return (
    <AuditContext.Provider value={contextValue}>
      {children}
    </AuditContext.Provider>
  );
};

/**
 * Hook to use the audit context
 */
export const useAudit = (): AuditContextType => {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};

/**
 * Hook to get current audit session
 */
export const useAuditSession = () => {
  const { state } = useAudit();
  return state.currentSession;
};

/**
 * Hook to get audit progress
 */
export const useAuditProgress = () => {
  const session = useAuditSession();
  return session?.progress || null;
};

/**
 * Hook to get audit results with filtering and sorting
 */
export const useAuditResults = () => {
  const { state } = useAudit();
  const session = state.currentSession;
  
  if (!session) {
    return [];
  }

  let filteredResults = session.results;

  // Apply filters
  if (state.filters.auditTypes.length > 0) {
    filteredResults = filteredResults.filter(result => 
      state.filters.auditTypes.includes(result.type)
    );
  }

  if (state.filters.urls.length > 0) {
    filteredResults = filteredResults.filter(result => 
      state.filters.urls.includes(result.fullUrl)
    );
  }

  if (state.filters.searchTerm) {
    const searchTerm = state.filters.searchTerm.toLowerCase();
    filteredResults = filteredResults.filter(result => 
      result.fullUrl.toLowerCase().includes(searchTerm) ||
      result.details.toLowerCase().includes(searchTerm) ||
      result.linkText.toLowerCase().includes(searchTerm)
    );
  }

  // Apply sorting
  filteredResults.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (state.sortOptions.field) {
      case 'url':
        aValue = a.fullUrl;
        bValue = b.fullUrl;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'timestamp':
        // For timestamp, we'll use the order they were added (array index)
        aValue = session.results.indexOf(a);
        bValue = session.results.indexOf(b);
        break;
      default:
        aValue = a.fullUrl;
        bValue = b.fullUrl;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return state.sortOptions.direction === 'asc' ? comparison : -comparison;
    } else {
      const comparison = (aValue as number) - (bValue as number);
      return state.sortOptions.direction === 'asc' ? comparison : -comparison;
    }
  });

  return filteredResults;
};
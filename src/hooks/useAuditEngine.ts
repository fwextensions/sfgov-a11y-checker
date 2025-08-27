/**
 * Hook for managing the audit engine
 */

'use client';

import { useCallback, useRef, useMemo } from 'react';
import { AuditEngine, AuditEngineCallbacks } from '@/lib/auditEngine';
import { AuditConfig } from '@/types';
import { useAudit } from '@/context/AuditContext';

export const useAuditEngine = () => {
  const { 
    state, 
    startAudit, 
    updateProgress, 
    addResults, 
    addError, 
    completeAudit,
    pauseAudit,
    resumeAudit,
    cancelAudit
  } = useAudit();
  
  const engineRef = useRef<AuditEngine | null>(null);

  const callbacks: AuditEngineCallbacks = useMemo(() => ({
    onProgress: (progress) => {
      updateProgress(progress);
    },
    onResults: (results) => {
      addResults(results);
    },
    onError: (error) => {
      addError(error);
    },
    onComplete: () => {
      completeAudit();
      engineRef.current = null;
    }
  }), [updateProgress, addResults, addError, completeAudit]);

  const start = useCallback(async (config: AuditConfig) => {
    if (state.uploadedUrls.length === 0) {
      throw new Error('No URLs to audit');
    }

    // Start the audit session
    startAudit(config);
    
    // Create and start the engine
    engineRef.current = new AuditEngine(config, callbacks);
    await engineRef.current.startAudit(state.uploadedUrls);
  }, [state.uploadedUrls, startAudit, callbacks]);

  const pause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
      pauseAudit();
    }
  }, [pauseAudit]);

  const resume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resume();
      resumeAudit();
    }
  }, [resumeAudit]);

  const cancel = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.cancel();
      cancelAudit();
      engineRef.current = null;
    }
  }, [cancelAudit]);

  const isRunning = engineRef.current?.isRunning() || false;
  const isPaused = engineRef.current?.isPausedState() || false;

  return {
    start,
    pause,
    resume,
    cancel,
    isRunning,
    isPaused,
    canStart: state.uploadedUrls.length > 0 && !isRunning
  };
};
/**
 * Main page for the Web Accessibility Auditor
 */

'use client';

import React from 'react';
import { AuditProvider } from '@/context/AuditContext';
import { AccessibilityAuditorApp } from '@/components/AccessibilityAuditorApp';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <AuditProvider>
        <AccessibilityAuditorApp />
      </AuditProvider>
    </ErrorBoundary>
  );
}
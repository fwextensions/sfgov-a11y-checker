/**
 * Base auditor class and utilities for accessibility auditing
 */

import { BaseAuditor, AuditResult, AuditType } from '@/types';
import { HTMLProcessor } from './htmlProcessor';

export abstract class AbstractBaseAuditor implements BaseAuditor {
  abstract auditType: AuditType;
  protected htmlProcessor: HTMLProcessor;

  constructor() {
    this.htmlProcessor = new HTMLProcessor();
  }

  /**
   * Main audit method - must be implemented by subclasses
   */
  abstract audit(url: string, signal: AbortSignal): Promise<AuditResult[]>;

  /**
   * Fetch and parse HTML content from a URL using proxy API
   */
  protected async fetchAndParseHTML(url: string, signal: AbortSignal): Promise<Document> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      // Combine signals
      const combinedSignal = this.combineAbortSignals([signal, controller.signal]);
      
      // Use proxy API to bypass CORS restrictions
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl, {
        signal: combinedSignal,
        method: 'GET',
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched ${url}, HTML length:`, data.html?.length || 0);
      return this.htmlProcessor.parseHTML(data.html);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request was cancelled');
        }
        
        throw new Error(`Failed to fetch ${url}: ${error.message}`);
      }
      throw new Error(`Failed to fetch ${url}: Unknown error`);
    }
  }

  /**
   * Create a standardized audit result
   */
  protected createAuditResult(
    url: string,
    details: string,
    linkText: string = '',
    targetUrl: string = '',
    imageFilename: string = ''
  ): AuditResult {
    return {
      fullUrl: url,
      type: this.auditType,
      details,
      linkText,
      targetUrl,
      imageFilename
    };
  }

  /**
   * Combine multiple AbortSignals into one
   */
  private combineAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      
      signal.addEventListener('abort', () => {
        controller.abort();
      });
    }
    
    return controller.signal;
  }

  /**
   * Handle errors gracefully and return empty results
   */
  protected handleError(error: Error, url: string): AuditResult[] {
    console.warn(`Audit error for ${url}:`, error.message);
    return [];
  }

  /**
   * Check if audit should continue (not aborted)
   */
  protected checkAbortSignal(signal: AbortSignal): void {
    if (signal.aborted) {
      throw new Error('Audit was cancelled');
    }
  }
}

/**
 * Utility functions for common audit patterns
 */
export class AuditUtils {
  /**
   * Check if text contains any of the trigger phrases
   */
  static containsTriggerPhrase(text: string, triggerPhrases: string[]): boolean {
    const normalizedText = text.toLowerCase().trim();
    return triggerPhrases.some(phrase => normalizedText.includes(phrase.toLowerCase()));
  }

  /**
   * Check if text contains any excluded phrases
   */
  static containsExcludedPhrase(text: string, excludedPhrases: string[]): boolean {
    const normalizedText = text.toLowerCase().trim();
    return excludedPhrases.some(phrase => normalizedText.includes(phrase.toLowerCase()));
  }

  /**
   * Extract filename from URL
   */
  static extractFilename(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split('/');
      return segments[segments.length - 1] || '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Check if URL has specific file extension
   */
  static hasFileExtension(url: string, extensions: string[]): boolean {
    const extension = HTMLProcessor.getFileExtension(url);
    return extensions.includes(extension);
  }

  /**
   * Validate heading hierarchy
   */
  static validateHeadingHierarchy(headings: Element[]): { isValid: boolean; sequence: number[] } {
    const sequence = headings.map(h => parseInt(h.tagName.charAt(1)));
    let isValid = true;
    
    for (let i = 1; i < sequence.length; i++) {
      const current = sequence[i];
      const previous = sequence[i - 1];
      
      // Check if we skip more than one level
      if (current > previous + 1) {
        isValid = false;
        break;
      }
    }
    
    return { isValid, sequence };
  }

  /**
   * Check if element is interactive
   */
  static isInteractiveElement(element: Element): boolean {
    const interactiveTags = ['a', 'button', 'input', 'select', 'textarea'];
    const tagName = element.tagName.toLowerCase();
    
    if (interactiveTags.includes(tagName)) {
      return true;
    }
    
    // Check for interactive roles
    const role = element.getAttribute('role')?.toLowerCase();
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio'];
    
    return interactiveRoles.includes(role || '');
  }

  /**
   * Get table structure information
   */
  static analyzeTableStructure(table: Element): {
    hasCaption: boolean;
    caption: string;
    hasColumnHeaders: boolean;
    hasRowHeaders: boolean;
  } {
    const caption = table.querySelector('caption');
    const thead = table.querySelector('thead');
    
    // Check for column headers
    let hasColumnHeaders = false;
    if (thead && thead.querySelectorAll('th').length > 0) {
      hasColumnHeaders = true;
    } else {
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('th, td');
        hasColumnHeaders = Array.from(cells).every(cell => cell.tagName === 'TH');
      }
    }
    
    // Check for row headers
    const hasRowHeaders = Array.from(table.querySelectorAll('tr')).some(tr =>
      tr.querySelectorAll('th').length > 0 && tr.querySelectorAll('td').length > 0
    );
    
    return {
      hasCaption: !!caption,
      caption: caption?.textContent?.trim() || '',
      hasColumnHeaders,
      hasRowHeaders
    };
  }
}
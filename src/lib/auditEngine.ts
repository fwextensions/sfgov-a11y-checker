/**
 * Main Audit Engine
 * Coordinates all individual auditors and manages the audit process
 */

import { AuditConfig, AuditResult, AuditError, BaseAuditor } from '@/types';
import { RateLimiter } from './rateLimiter';
import {
  ImageAuditor,
  LinkAuditor,
  ButtonAuditor,
  HeadingAuditor,
  TableAuditor,
  DocumentAuditor
} from './auditors';

export interface AuditEngineCallbacks {
  onProgress: (progress: { currentUrl: string; completed: number; total: number }) => void;
  onResults: (results: AuditResult[]) => void;
  onError: (error: AuditError) => void;
  onComplete: () => void;
}

export class AuditEngine {
  private auditors: BaseAuditor[];
  private rateLimiter: RateLimiter;
  private abortController: AbortController | null = null;
  private isPaused = false;
  private callbacks: AuditEngineCallbacks;

  constructor(config: AuditConfig, callbacks: AuditEngineCallbacks) {
    this.auditors = [
      new ImageAuditor(),
      new LinkAuditor(),
      new ButtonAuditor(),
      new HeadingAuditor(),
      new TableAuditor(),
      new DocumentAuditor()
    ];
    
    this.rateLimiter = new RateLimiter(
      config.concurrentRequests,
      config.delayBetweenRequests
    );
    
    this.callbacks = callbacks;
  }

  /**
   * Start the audit process
   */
  async startAudit(urls: string[]): Promise<void> {
    this.abortController = new AbortController();
    this.isPaused = false;
    
    try {
      await this.processUrls(urls);
      this.callbacks.onComplete();
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        this.callbacks.onError({
          url: 'system',
          error: error.message,
          timestamp: new Date()
        });
      }
    }
  }  /**
   
* Process URLs with rate limiting and progress tracking
   */
  private async processUrls(urls: string[]): Promise<void> {
    let completed = 0;
    
    const processUrl = async (url: string): Promise<void> => {
      if (this.abortController?.signal.aborted) {
        throw new Error('Audit was cancelled');
      }
      
      // Wait if paused
      while (this.isPaused && !this.abortController?.signal.aborted) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.callbacks.onProgress({
        currentUrl: url,
        completed,
        total: urls.length
      });
      
      try {
        const urlResults = await this.auditUrl(url);
        console.log(`Audit results for ${url}:`, urlResults.length, 'results');
        if (urlResults.length > 0) {
          console.log('Sending results to callback:', urlResults);
          this.callbacks.onResults(urlResults);
        } else {
          console.log('No results found for', url);
        }
      } catch (error) {
        this.callbacks.onError({
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
      
      completed++;
      this.callbacks.onProgress({
        currentUrl: completed < urls.length ? urls[completed] : '',
        completed,
        total: urls.length
      });
    };
    
    // Process URLs with rate limiting
    await this.rateLimiter.processItems(urls, processUrl, this.abortController!.signal);
  }

  /**
   * Audit a single URL with all auditors
   */
  private async auditUrl(url: string): Promise<AuditResult[]> {
    const allResults: AuditResult[] = [];
    
    for (const auditor of this.auditors) {
      if (this.abortController?.signal.aborted) {
        break;
      }
      
      try {
        const results = await auditor.audit(url, this.abortController!.signal);
        allResults.push(...results);
      } catch (error) {
        // Individual auditor failures don't stop the entire audit
        console.warn(`Auditor ${auditor.auditType} failed for ${url}:`, error);
      }
    }
    
    return allResults;
  }

  /**
   * Pause the audit
   */
  pause(): void {
    this.isPaused = true;
    this.rateLimiter.pause();
  }

  /**
   * Resume the audit
   */
  resume(): void {
    this.isPaused = false;
    this.rateLimiter.resume();
  }

  /**
   * Cancel the audit
   */
  cancel(): void {
    this.abortController?.abort();
    this.rateLimiter.cancel();
  }

  /**
   * Check if audit is currently running
   */
  isRunning(): boolean {
    return this.abortController !== null && !this.abortController.signal.aborted && !this.isPaused;
  }

  /**
   * Check if audit is paused
   */
  isPausedState(): boolean {
    return this.isPaused;
  }
}
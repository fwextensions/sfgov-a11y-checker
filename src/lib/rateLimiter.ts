/**
 * Rate Limiter for controlling request frequency
 * Manages concurrent requests and delays to prevent server overload
 */

export class RateLimiter {
  private maxConcurrent: number;
  private delayBetweenBatches: number;
  private activeRequests = 0;
  private isPaused = false;
  private isCancelled = false;
  private queue: Array<() => Promise<void>> = [];

  constructor(maxConcurrent: number, delayBetweenBatches: number) {
    this.maxConcurrent = maxConcurrent;
    this.delayBetweenBatches = delayBetweenBatches;
  }

  /**
   * Process an array of items with rate limiting
   */
  async processItems<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    signal: AbortSignal
  ): Promise<void> {
    this.isCancelled = false;
    
    return new Promise((resolve, reject) => {
      let completed = 0;

      const processNext = async () => {
        // Check for cancellation or completion
        if (this.isCancelled || signal.aborted) {
          reject(new Error('Processing cancelled'));
          return;
        }

        // Wait if paused
        while (this.isPaused && !this.isCancelled && !signal.aborted) {
          await new Promise(resolveWait => setTimeout(resolveWait, 100));
        }

        if (completed >= items.length) {
          resolve();
          return;
        }

        if (this.activeRequests >= this.maxConcurrent) {
          return;
        }

        const item = items[completed];
        completed++;
        this.activeRequests++;

        try {
          await processor(item);
        } catch (error) {
          console.warn('Item processing failed:', error);
        } finally {
          this.activeRequests--;
          
          // Add delay between batches if needed
          if (this.delayBetweenBatches > 0 && this.activeRequests === 0 && completed < items.length) {
            await new Promise(resolveDelay => setTimeout(resolveDelay, this.delayBetweenBatches));
          }
          
          // Process next item (use setTimeout instead of setImmediate for browser compatibility)
          setTimeout(processNext, 0);
        }
      };

      // Start initial batch
      for (let i = 0; i < Math.min(this.maxConcurrent, items.length); i++) {
        processNext().catch(reject);
      }
    });
  }

  /**
   * Pause processing
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume processing
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Cancel all processing
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      activeRequests: this.activeRequests,
      isPaused: this.isPaused,
      isCancelled: this.isCancelled
    };
  }
}
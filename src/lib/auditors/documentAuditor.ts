/**
 * Document Link Auditor
 * Detects PDF and Office file links
 */

import { AbstractBaseAuditor, AuditUtils } from '../baseAuditor';
import { AuditResult, AuditType } from '@/types';

export class DocumentAuditor extends AbstractBaseAuditor {
  auditType = AuditType.PDF_LINK;

  // Allowed Office document extensions
  private readonly OFFICE_EXTENSIONS = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
  
  // PDF extension
  private readonly PDF_EXTENSION = '.pdf';

  async audit(url: string, signal: AbortSignal): Promise<AuditResult[]> {
    try {
      this.checkAbortSignal(signal);
      
      const document = await this.fetchAndParseHTML(url, signal);
      const results: AuditResult[] = [];
      
      // Find all links
      const links = document.querySelectorAll('a[href]');
      
      links.forEach(link => {
        this.checkAbortSignal(signal);
        
        const href = link.getAttribute('href') || '';
        const linkText = link.textContent?.trim() || '';
        
        // Remove query parameters and fragments for extension checking
        const cleanHref = href.split('?')[0].split('#')[0];
        
        // Check for PDF links
        if (cleanHref.toLowerCase().endsWith(this.PDF_EXTENSION)) {
          const fullPdfUrl = this.resolveUrl(href, url);
          results.push(this.createAuditResult(
            url,
            '',
            linkText,
            fullPdfUrl,
            ''
          ));
        }
        
        // Check for Office document links
        for (const ext of this.OFFICE_EXTENSIONS) {
          if (cleanHref.toLowerCase().endsWith(ext)) {
            const fullFileUrl = this.resolveUrl(href, url);
            results.push({
              fullUrl: url,
              type: AuditType.OFFICE_LINK,
              details: '',
              linkText: linkText,
              targetUrl: fullFileUrl,
              imageFilename: ''
            });
            break; // Only match one extension per link
          }
        }
      });
      
      return results;
    } catch (error) {
      return this.handleError(error as Error, url);
    }
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  private resolveUrl(href: string, baseUrl: string): string {
    try {
      return new URL(href, baseUrl).href;
    } catch (error) {
      // If URL construction fails, return the original href
      return href;
    }
  }
}
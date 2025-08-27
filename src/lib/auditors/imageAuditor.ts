/**
 * Image Accessibility Auditor
 * Checks for missing alt text and validates existing alt text
 */

import { AbstractBaseAuditor, AuditUtils } from '../baseAuditor';
import { AuditResult, AuditType } from '@/types';

export class ImageAuditor extends AbstractBaseAuditor {
  auditType = AuditType.IMAGE_MISSING_ALT;

  async audit(url: string, signal: AbortSignal): Promise<AuditResult[]> {
    try {
      this.checkAbortSignal(signal);
      
      const document = await this.fetchAndParseHTML(url, signal);
      const results: AuditResult[] = [];
      
      // Find all images on the page
      const images = document.querySelectorAll('img');
      console.log(`ImageAuditor: Found ${images.length} images on ${url}`);
      
      images.forEach(img => {
        this.checkAbortSignal(signal);
        
        const altText = img.getAttribute('alt');
        const src = img.getAttribute('src') || '';
        const filename = AuditUtils.extractFilename(src);
        
        if (!altText || altText.trim() === '') {
          // Image missing alt text
          results.push(this.createAuditResult(
            url,
            '',
            '',
            src,
            filename
          ));
        } else {
          // Image with alt text (for reporting purposes)
          results.push({
            fullUrl: url,
            type: AuditType.IMAGE_WITH_ALT,
            details: `alt="${altText}"`,
            linkText: '',
            targetUrl: src,
            imageFilename: filename
          });
        }
      });
      
      return results;
    } catch (error) {
      return this.handleError(error as Error, url);
    }
  }
}
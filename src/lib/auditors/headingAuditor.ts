/**
 * Heading Hierarchy Auditor
 * Validates proper heading sequence (h1-h6) structure
 */

import { AbstractBaseAuditor, AuditUtils } from '../baseAuditor';
import { AuditResult, AuditType } from '@/types';

export class HeadingAuditor extends AbstractBaseAuditor {
  auditType = AuditType.HEADING_HIERARCHY;

  async audit(url: string, signal: AbortSignal): Promise<AuditResult[]> {
    try {
      this.checkAbortSignal(signal);
      
      const document = await this.fetchAndParseHTML(url, signal);
      const results: AuditResult[] = [];
      
      // Find all heading elements
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      
      if (headings.length === 0) {
        return results;
      }
      
      this.checkAbortSignal(signal);
      
      // Validate heading hierarchy
      const { isValid, sequence } = AuditUtils.validateHeadingHierarchy(headings);
      
      if (!isValid) {
        results.push(this.createAuditResult(
          url,
          `Improper heading sequence: ${sequence.join(', ')}`,
          '',
          '',
          ''
        ));
      }
      
      return results;
    } catch (error) {
      return this.handleError(error as Error, url);
    }
  }
}
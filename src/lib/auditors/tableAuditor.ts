/**
 * Table Accessibility Auditor
 * Checks for proper table headers and captions
 */

import { AbstractBaseAuditor, AuditUtils } from '../baseAuditor';
import { AuditResult, AuditType } from '@/types';

export class TableAuditor extends AbstractBaseAuditor {
  auditType = AuditType.TABLE_INFO;

  async audit(url: string, signal: AbortSignal): Promise<AuditResult[]> {
    try {
      this.checkAbortSignal(signal);
      
      const document = await this.fetchAndParseHTML(url, signal);
      const results: AuditResult[] = [];
      
      // Find all table elements
      const tables = document.querySelectorAll('table');
      
      tables.forEach(table => {
        this.checkAbortSignal(signal);
        
        const tableInfo = AuditUtils.analyzeTableStructure(table);
        
        // Create a detailed report for each table
        const details = [
          `Caption: ${tableInfo.caption || 'none'}`,
          `Row headers: ${tableInfo.hasRowHeaders ? 'yes' : 'no'}`,
          `Column headers: ${tableInfo.hasColumnHeaders ? 'yes' : 'no'}`
        ].join(', ');
        
        results.push(this.createAuditResult(
          url,
          details,
          '',
          '',
          ''
        ));
      });
      
      return results;
    } catch (error) {
      return this.handleError(error as Error, url);
    }
  }
}
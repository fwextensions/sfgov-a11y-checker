/**
 * CSV Export functionality
 * Generates and downloads CSV files from audit results
 */

import { AuditResult } from '@/types';

export class CSVExporter {
  /**
   * Convert audit results to CSV format
   */
  static generateCSV(results: AuditResult[]): string {
    if (results.length === 0) {
      return 'Full url,Type,Details,Link text,Target url,Image filename\n';
    }

    // CSV headers matching the original script format
    const headers = [
      'Full url',
      'Type', 
      'Details',
      'Link text',
      'Target url',
      'Image filename'
    ];

    // Convert results to CSV rows
    const rows = results.map(result => [
      this.escapeCSVField(result.fullUrl),
      this.escapeCSVField(result.type),
      this.escapeCSVField(result.details),
      this.escapeCSVField(result.linkText),
      this.escapeCSVField(result.targetUrl),
      this.escapeCSVField(result.imageFilename)
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Escape CSV field content
   */
  private static escapeCSVField(field: string): string {
    if (!field) return '';
    
    // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (field.includes(',') || field.includes('\n') || field.includes('"')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    
    return field;
  }

  /**
   * Generate filename with timestamp
   */
  static generateFilename(prefix = 'accessibility-audit'): string {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, -5); // Remove milliseconds and Z
    
    return `${prefix}_${timestamp}.csv`;
  }

  /**
   * Download CSV file
   */
  static downloadCSV(csvContent: string, filename?: string): void {
    const finalFilename = filename || this.generateFilename();
    
    // Create blob with UTF-8 BOM for proper Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  }

  /**
   * Export audit results as CSV
   */
  static exportResults(results: AuditResult[], filename?: string): void {
    console.log('CSVExporter.exportResults called with:', results.length, 'results');
    const csvContent = this.generateCSV(results);
    console.log('Generated CSV content length:', csvContent.length);
    console.log('CSV preview:', csvContent.substring(0, 200));
    this.downloadCSV(csvContent, filename);
    console.log('Download triggered');
  }

  /**
   * Get export statistics
   */
  static getExportStats(results: AuditResult[]): {
    totalResults: number;
    uniqueUrls: number;
    categories: number;
    estimatedFileSize: string;
  } {
    const uniqueUrls = new Set(results.map(r => r.fullUrl)).size;
    const categories = new Set(results.map(r => r.type)).size;
    
    // Estimate file size (rough calculation)
    const csvContent = this.generateCSV(results);
    const sizeInBytes = new Blob([csvContent]).size;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    
    let estimatedFileSize: string;
    if (sizeInKB < 1024) {
      estimatedFileSize = `${sizeInKB} KB`;
    } else {
      const sizeInMB = Math.round(sizeInKB / 1024 * 10) / 10;
      estimatedFileSize = `${sizeInMB} MB`;
    }

    return {
      totalResults: results.length,
      uniqueUrls,
      categories,
      estimatedFileSize
    };
  }
}
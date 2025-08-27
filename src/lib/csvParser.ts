/**
 * CSV parsing utilities for the Web Accessibility Auditor
 */

import { CSVParseResult, URLValidationResult, CSVRow } from '@/types';
import { AUDIT_CONSTANTS } from '@/types';

export class CSVParser {
  /**
   * Parse CSV content and extract URLs from the first column
   */
  static async parseCSV(content: string): Promise<CSVParseResult> {
    const lines = content.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    const urls: string[] = [];
    
    if (lines.length === 0) {
      return {
        urls: [],
        errors: ['CSV file is empty'],
        totalRows: 0,
        validUrls: 0
      };
    }

    // Detect if first row is header
    const hasHeader = this.detectHeader(lines[0]);
    const startIndex = hasHeader ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i].trim();
      
      if (!line) continue;
      
      try {
        const row = this.parseCSVRow(line);
        const firstColumn = row[0]?.trim();
        
        if (!firstColumn) {
          errors.push(`Line ${lineNumber}: Empty URL field`);
          continue;
        }
        
        const validation = this.validateURL(firstColumn);
        if (validation.isValid) {
          urls.push(validation.url);
        } else {
          errors.push(`Line ${lineNumber}: ${validation.error}`);
        }
      } catch (error) {
        errors.push(`Line ${lineNumber}: Failed to parse CSV row - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      urls: [...new Set(urls)], // Remove duplicates
      errors,
      totalRows: lines.length - (hasHeader ? 1 : 0),
      validUrls: urls.length
    };
  }

  /**
   * Parse a single CSV row, handling quoted fields and commas
   */
  private static parseCSVRow(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
  }

  /**
   * Detect if the first row is likely a header
   */
  private static detectHeader(firstLine: string): boolean {
    const firstField = this.parseCSVRow(firstLine)[0]?.toLowerCase().trim();
    const headerKeywords = ['url', 'link', 'website', 'address', 'site'];
    
    return headerKeywords.some(keyword => firstField?.includes(keyword));
  }

  /**
   * Validate and normalize a URL
   */
  static validateURL(url: string): URLValidationResult {
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      return {
        url: trimmedUrl,
        isValid: false,
        error: 'URL is empty'
      };
    }

    // Check for email addresses
    if (trimmedUrl.includes('mailto:') || (trimmedUrl.includes('@') && !trimmedUrl.includes('://'))) {
      return {
        url: trimmedUrl,
        isValid: false,
        error: 'Email addresses are not supported'
      };
    }

    let normalizedUrl = trimmedUrl;

    // Add protocol if missing
    if (!normalizedUrl.match(/^https?:\/\//)) {
      if (normalizedUrl.startsWith('www.')) {
        normalizedUrl = `https://${normalizedUrl}`;
      } else if (normalizedUrl.includes('.')) {
        normalizedUrl = `https://${normalizedUrl}`;
      } else {
        return {
          url: trimmedUrl,
          isValid: false,
          error: 'Invalid URL format'
        };
      }
    }

    try {
      const urlObj = new URL(normalizedUrl);
      
      // Check for valid TLD
      const hasValidTLD = AUDIT_CONSTANTS.VALID_TLDS.some(tld => 
        urlObj.hostname.toLowerCase().endsWith(tld)
      );
      
      if (!hasValidTLD) {
        return {
          url: trimmedUrl,
          isValid: false,
          error: 'URL does not have a recognized top-level domain'
        };
      }

      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          url: trimmedUrl,
          isValid: false,
          error: 'URL must use HTTP or HTTPS protocol'
        };
      }

      return {
        url: normalizedUrl,
        isValid: true
      };
    } catch (error) {
      return {
        url: trimmedUrl,
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Generate example CSV content for user guidance
   */
  static generateExampleCSV(): string {
    return `URL,Description
https://example.com,Homepage
https://example.com/about,About page
https://example.com/contact,Contact page
https://test.gov,Government site
https://demo.org/services,Services page`;
  }
}
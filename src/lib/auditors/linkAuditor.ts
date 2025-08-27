/**
 * Link Accessibility Auditor
 * Identifies vague link text and raw URLs in page content
 */

import { AbstractBaseAuditor, AuditUtils } from '../baseAuditor';
import { AuditResult, AuditType } from '@/types';

export class LinkAuditor extends AbstractBaseAuditor {
  auditType = AuditType.INACCESSIBLE_LINK;

  // Trigger phrases that indicate vague link text
  private readonly TRIGGER_PHRASES = [
    'click here', 'read more', 'learn more', 'go here', 'see more', 
    'click', 'details', 'see details', 'more', 'see all', 'view all'
  ];

  // Phrases to exclude from vague link detection
  private readonly EXCLUDED_PHRASES = ['learn more about us'];

  // Pattern for detecting raw URLs in text content
  private readonly RAW_URL_PATTERN = /(?<!@)\b(?:https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s<>"']*)?/g;

  // Valid TLDs for URL validation
  private readonly VALID_TLDS = ['.com', '.org', '.net', '.gov', '.edu', '.info', '.io', '.co', '.us', '.ca'];

  async audit(url: string, signal: AbortSignal): Promise<AuditResult[]> {
    try {
      this.checkAbortSignal(signal);
      
      const document = await this.fetchAndParseHTML(url, signal);
      const results: AuditResult[] = [];
      
      // Check for inaccessible link text
      results.push(...this.findInaccessibleLinks(document, url, signal));
      
      // Check for raw URLs in text content
      results.push(...this.findRawUrls(document, url, signal));
      
      return results;
    } catch (error) {
      return this.handleError(error as Error, url);
    }
  }

  /**
   * Find links with vague or inaccessible text
   */
  private findInaccessibleLinks(document: Document, url: string, signal: AbortSignal): AuditResult[] {
    const results: AuditResult[] = [];
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      this.checkAbortSignal(signal);
      
      const linkText = link.textContent?.trim().toLowerCase() || '';
      const href = link.getAttribute('href') || '';
      
      // Check if link text contains trigger phrases
      if (AuditUtils.containsTriggerPhrase(linkText, this.TRIGGER_PHRASES)) {
        // Skip if it contains excluded phrases
        if (!AuditUtils.containsExcludedPhrase(linkText, this.EXCLUDED_PHRASES)) {
          results.push(this.createAuditResult(
            url,
            '',
            link.textContent?.trim() || '',
            href,
            ''
          ));
        }
      }
    });
    
    return results;
  }

  /**
   * Find raw URLs in page text content
   */
  private findRawUrls(document: Document, url: string, signal: AbortSignal): AuditResult[] {
    const results: AuditResult[] = [];
    
    this.checkAbortSignal(signal);
    
    // Get visible text content from the page
    const visibleText = document.body.textContent || '';
    const rawUrls = visibleText.match(this.RAW_URL_PATTERN) || [];
    
    rawUrls.forEach(rawUrl => {
      this.checkAbortSignal(signal);
      
      let fullUrl = rawUrl;
      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        fullUrl = 'https://' + rawUrl;
      }
      
      if (this.isValidUrl(fullUrl)) {
        results.push(this.createAuditResult(
          url,
          '',
          '',
          fullUrl,
          ''
        ));
      }
    });
    
    return results;
  }

  /**
   * Validate if a URL is valid based on TLD and format
   */
  private isValidUrl(url: string): boolean {
    // Skip email addresses
    if (url.includes('mailto:') || url.includes('@')) {
      return false;
    }
    
    // Check if URL ends with a valid TLD
    return this.VALID_TLDS.some(tld => url.toLowerCase().endsWith(tld));
  }
}
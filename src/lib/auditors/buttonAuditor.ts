/**
 * Button Accessibility Auditor
 * Detects missing labels and icon-only buttons
 */

import { AbstractBaseAuditor, AuditUtils } from '../baseAuditor';
import { AuditResult, AuditType } from '@/types';

export class ButtonAuditor extends AbstractBaseAuditor {
  auditType = AuditType.INACCESSIBLE_BUTTON;

  // Trigger phrases that indicate vague button labels
  private readonly TRIGGER_PHRASES = [
    'click here', 'read more', 'learn more', 'go here', 'see more', 
    'click', 'details', 'see details', 'more', 'see all', 'view all'
  ];

  // Phrases to exclude from vague button detection
  private readonly EXCLUDED_PHRASES = ['learn more about us'];

  async audit(url: string, signal: AbortSignal): Promise<AuditResult[]> {
    try {
      this.checkAbortSignal(signal);
      
      const document = await this.fetchAndParseHTML(url, signal);
      const results: AuditResult[] = [];
      
      // Find all buttons and form inputs
      const buttonElements = [
        ...Array.from(document.querySelectorAll('button')),
        ...Array.from(document.querySelectorAll('input[type="submit"], input[type="button"]'))
      ];
      
      buttonElements.forEach(element => {
        this.checkAbortSignal(signal);
        
        const label = this.extractButtonLabel(element);
        const labelText = (label || '').trim().toLowerCase();
        const hasLabel = Boolean(labelText);
        
        // Check if it only contains an icon or has no accessible label
        const isIconOnly = this.isIconOnlyButton(element, hasLabel);
        
        // Flag as inaccessible if: no label or contains vague label
        const hasVagueLabel = hasLabel && AuditUtils.containsTriggerPhrase(labelText, this.TRIGGER_PHRASES);
        const isExcluded = AuditUtils.containsExcludedPhrase(labelText, this.EXCLUDED_PHRASES);
        
        if ((isIconOnly || !hasLabel || hasVagueLabel) && !isExcluded) {
          const details = isIconOnly ? 'Missing accessible label (icon-only)' : 
                         !hasLabel ? 'Missing accessible label' : 
                         'Vague button label';
          
          results.push(this.createAuditResult(
            url,
            details,
            label || '',
            '',
            ''
          ));
        }
      });
      
      return results;
    } catch (error) {
      return this.handleError(error as Error, url);
    }
  }

  /**
   * Extract the accessible label from a button element
   */
  private extractButtonLabel(element: Element): string {
    // Check various sources for button label in order of preference
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel?.trim()) {
      return ariaLabel.trim();
    }
    
    const title = element.getAttribute('title');
    if (title?.trim()) {
      return title.trim();
    }
    
    const value = element.getAttribute('value');
    if (value?.trim()) {
      return value.trim();
    }
    
    const textContent = element.textContent?.trim();
    if (textContent) {
      return textContent;
    }
    
    // Check for aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = element.ownerDocument?.getElementById(labelledBy);
      if (labelElement?.textContent?.trim()) {
        return labelElement.textContent.trim();
      }
    }
    
    return '';
  }

  /**
   * Check if button is icon-only (has icon but no accessible text)
   */
  private isIconOnlyButton(element: Element, hasLabel: boolean): boolean {
    if (hasLabel) {
      return false;
    }
    
    // Check for SVG elements (common for icons)
    const hasSvg = element.querySelector('svg') !== null;
    
    // Check for icon classes (common patterns)
    const className = element.className || '';
    const hasIconClass = className.includes('icon') || 
                        className.includes('fa-') || 
                        className.includes('glyphicon') ||
                        className.includes('material-icons');
    
    // Check for image elements that might be icons
    const hasIconImage = element.querySelector('img') !== null;
    
    return hasSvg || hasIconClass || hasIconImage;
  }
}
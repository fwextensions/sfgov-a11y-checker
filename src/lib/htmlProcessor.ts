/**
 * HTML processing utilities using native DOMParser API
 */

import { HTMLProcessorInterface } from '@/types';

export class HTMLProcessor implements HTMLProcessorInterface {
  private parser: DOMParser;

  constructor() {
    this.parser = new DOMParser();
  }

  /**
   * Parse HTML string into a DOM Document
   */
  parseHTML(htmlString: string): Document {
    try {
      const doc = this.parser.parseFromString(htmlString, 'text/html');
      
      // Check for parser errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        console.warn('HTML parsing warning:', parserError.textContent);
      }
      
      return doc;
    } catch (error) {
      throw new Error(`Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract elements using CSS selectors
   */
  extractElements(document: Document, selectors: string[]): Element[] {
    const elements: Element[] = [];
    
    for (const selector of selectors) {
      try {
        const found = document.querySelectorAll(selector);
        elements.push(...Array.from(found));
      } catch (error) {
        console.warn(`Invalid CSS selector "${selector}":`, error);
      }
    }
    
    return elements;
  }

  /**
   * Analyze a single element (placeholder for specific auditor implementations)
   */
  analyzeElement(element: Element): any {
    return {
      tagName: element.tagName.toLowerCase(),
      attributes: this.getElementAttributes(element),
      textContent: element.textContent?.trim() || '',
      innerHTML: element.innerHTML
    };
  }

  /**
   * Get all attributes of an element as an object
   */
  private getElementAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    
    return attributes;
  }

  /**
   * Extract visible text content, excluding hidden elements
   */
  static getVisibleTextContent(element: Element): string {
    // Check if element is hidden
    if (element instanceof HTMLElement) {
      const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
      if (style && (
        style.display === 'none' || 
        style.visibility === 'hidden' || 
        style.opacity === '0'
      )) {
        return '';
      }
    }

    // Get text content from visible children
    let text = '';
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent || '';
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        text += this.getVisibleTextContent(child as Element);
      }
    }
    
    return text.trim();
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  static resolveURL(url: string, baseURL: string): string {
    try {
      return new URL(url, baseURL).href;
    } catch (error) {
      console.warn(`Failed to resolve URL "${url}" with base "${baseURL}":`, error);
      return url;
    }
  }

  /**
   * Extract file extension from URL
   */
  static getFileExtension(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastDot = pathname.lastIndexOf('.');
      
      if (lastDot === -1 || lastDot === pathname.length - 1) {
        return '';
      }
      
      return pathname.substring(lastDot).toLowerCase();
    } catch (error) {
      return '';
    }
  }

  /**
   * Check if an element has any of the specified attributes
   */
  static hasAnyAttribute(element: Element, attributes: string[]): boolean {
    return attributes.some(attr => element.hasAttribute(attr));
  }

  /**
   * Get the best available label for an element
   */
  static getElementLabel(element: Element): string {
    // Check various label sources in order of preference
    const labelSources = [
      'aria-label',
      'aria-labelledby',
      'title',
      'alt',
      'value',
      'placeholder'
    ];

    for (const attr of labelSources) {
      const value = element.getAttribute(attr);
      if (value && value.trim()) {
        return value.trim();
      }
    }

    // Check for associated label element
    if (element.id) {
      const label = element.ownerDocument?.querySelector(`label[for="${element.id}"]`);
      if (label && label.textContent) {
        return label.textContent.trim();
      }
    }

    // Check for parent label
    const parentLabel = element.closest('label');
    if (parentLabel && parentLabel.textContent) {
      return parentLabel.textContent.trim();
    }

    // Fall back to text content
    const textContent = element.textContent?.trim();
    return textContent || '';
  }

  /**
   * Check if element is likely decorative (icon, spacer, etc.)
   */
  static isDecorativeElement(element: Element): boolean {
    // Check for common decorative indicators
    const className = element.className?.toLowerCase() || '';
    const role = element.getAttribute('role')?.toLowerCase();
    
    const decorativeKeywords = [
      'icon', 'spacer', 'separator', 'decoration', 'ornament',
      'bullet', 'arrow', 'chevron', 'caret'
    ];
    
    return (
      role === 'presentation' ||
      role === 'none' ||
      decorativeKeywords.some(keyword => className.includes(keyword)) ||
      element.getAttribute('aria-hidden') === 'true'
    );
  }

  /**
   * Normalize whitespace in text content
   */
  static normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }
}
/**
 * @jest-environment jsdom
 */

import { HTMLProcessor } from '../htmlProcessor';

describe('HTMLProcessor', () => {
  let processor: HTMLProcessor;

  beforeEach(() => {
    processor = new HTMLProcessor();
  });

  describe('parseHTML', () => {
    it('should parse valid HTML', () => {
      const html = '<html><body><h1>Test</h1></body></html>';
      const doc = processor.parseHTML(html);
      
      expect(doc).toBeInstanceOf(Document);
      expect(doc.querySelector('h1')?.textContent).toBe('Test');
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<div><p>Unclosed paragraph<div>Another div</div>';
      const doc = processor.parseHTML(html);
      
      expect(doc).toBeInstanceOf(Document);
      expect(doc.querySelector('div')).toBeTruthy();
    });

    it('should handle empty HTML', () => {
      const doc = processor.parseHTML('');
      expect(doc).toBeInstanceOf(Document);
    });
  });

  describe('extractElements', () => {
    it('should extract elements using CSS selectors', () => {
      const html = '<div><img src="test.jpg" alt="test"><a href="#link">Link</a></div>';
      const doc = processor.parseHTML(html);
      
      const elements = processor.extractElements(doc, ['img', 'a']);
      
      expect(elements).toHaveLength(2);
      expect(elements[0].tagName).toBe('IMG');
      expect(elements[1].tagName).toBe('A');
    });

    it('should handle invalid selectors gracefully', () => {
      const html = '<div><p>Test</p></div>';
      const doc = processor.parseHTML(html);
      
      const elements = processor.extractElements(doc, ['p', ':::invalid:::']);
      
      expect(elements).toHaveLength(1);
      expect(elements[0].tagName).toBe('P');
    });
  });

  describe('static utility methods', () => {
    describe('resolveURL', () => {
      it('should resolve relative URLs', () => {
        const result = HTMLProcessor.resolveURL('/path/page.html', 'https://example.com');
        expect(result).toBe('https://example.com/path/page.html');
      });

      it('should handle absolute URLs', () => {
        const result = HTMLProcessor.resolveURL('https://other.com/page.html', 'https://example.com');
        expect(result).toBe('https://other.com/page.html');
      });

      it('should handle invalid URLs gracefully', () => {
        const result = HTMLProcessor.resolveURL('invalid-url', 'invalid-base');
        expect(result).toBe('invalid-url');
      });
    });

    describe('getFileExtension', () => {
      it('should extract file extensions', () => {
        expect(HTMLProcessor.getFileExtension('https://example.com/file.pdf')).toBe('.pdf');
        expect(HTMLProcessor.getFileExtension('https://example.com/image.jpg')).toBe('.jpg');
        expect(HTMLProcessor.getFileExtension('https://example.com/doc.docx')).toBe('.docx');
      });

      it('should handle URLs without extensions', () => {
        expect(HTMLProcessor.getFileExtension('https://example.com/page')).toBe('');
        expect(HTMLProcessor.getFileExtension('https://example.com/')).toBe('');
      });

      it('should handle invalid URLs', () => {
        expect(HTMLProcessor.getFileExtension('not-a-url')).toBe('');
      });
    });

    describe('getElementLabel', () => {
      it('should get aria-label', () => {
        const html = '<button aria-label="Close dialog">X</button>';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const button = doc.querySelector('button')!;
        
        expect(HTMLProcessor.getElementLabel(button)).toBe('Close dialog');
      });

      it('should fall back to text content', () => {
        const html = '<button>Click me</button>';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const button = doc.querySelector('button')!;
        
        expect(HTMLProcessor.getElementLabel(button)).toBe('Click me');
      });

      it('should get title attribute', () => {
        const html = '<img src="test.jpg" title="Test image">';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const img = doc.querySelector('img')!;
        
        expect(HTMLProcessor.getElementLabel(img)).toBe('Test image');
      });
    });

    describe('isDecorativeElement', () => {
      it('should identify decorative elements', () => {
        const html = '<span class="icon-arrow" aria-hidden="true"></span>';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const span = doc.querySelector('span')!;
        
        expect(HTMLProcessor.isDecorativeElement(span)).toBe(true);
      });

      it('should identify presentation role', () => {
        const html = '<div role="presentation"></div>';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const div = doc.querySelector('div')!;
        
        expect(HTMLProcessor.isDecorativeElement(div)).toBe(true);
      });

      it('should not flag content elements as decorative', () => {
        const html = '<p>Regular content</p>';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const p = doc.querySelector('p')!;
        
        expect(HTMLProcessor.isDecorativeElement(p)).toBe(false);
      });
    });

    describe('normalizeWhitespace', () => {
      it('should normalize whitespace', () => {
        expect(HTMLProcessor.normalizeWhitespace('  hello   world  ')).toBe('hello world');
        expect(HTMLProcessor.normalizeWhitespace('line1\n\nline2')).toBe('line1 line2');
        expect(HTMLProcessor.normalizeWhitespace('\t\ttext\t\t')).toBe('text');
      });
    });
  });
});
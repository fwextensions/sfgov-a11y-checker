/**
 * Unit tests for ImageAuditor
 */

import { ImageAuditor } from '../imageAuditor';
import { AuditType } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('ImageAuditor', () => {
  let auditor: ImageAuditor;
  let mockAbortController: AbortController;

  beforeEach(() => {
    auditor = new ImageAuditor();
    mockAbortController = new AbortController();
    jest.clearAllMocks();
  });

  const mockFetchResponse = (html: string) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(html),
    });
  };

  describe('audit', () => {
    it('should detect images missing alt text', async () => {
      const html = `
        <html>
          <body>
            <img src="/image1.jpg" />
            <img src="/image2.png" alt="" />
            <img src="/image3.gif" alt="Valid alt text" />
          </body>
        </html>
      `;
      
      mockFetchResponse(html);
      
      const results = await auditor.audit('https://example.com', mockAbortController.signal);
      
      // Should find 2 images missing alt text and 1 with alt text
      expect(results).toHaveLength(3);
      
      // Check missing alt text results
      const missingAltResults = results.filter(r => r.type === AuditType.IMAGE_MISSING_ALT);
      expect(missingAltResults).toHaveLength(2);
      expect(missingAltResults[0].targetUrl).toBe('/image1.jpg');
      expect(missingAltResults[0].imageFilename).toBe('image1.jpg');
      expect(missingAltResults[1].targetUrl).toBe('/image2.png');
      expect(missingAltResults[1].imageFilename).toBe('image2.png');
      
      // Check image with alt text result
      const withAltResults = results.filter(r => r.type === AuditType.IMAGE_WITH_ALT);
      expect(withAltResults).toHaveLength(1);
      expect(withAltResults[0].details).toBe('alt="Valid alt text"');
      expect(withAltResults[0].targetUrl).toBe('/image3.gif');
      expect(withAltResults[0].imageFilename).toBe('image3.gif');
    });

    it('should handle images with complex src URLs', async () => {
      const html = `
        <html>
          <body>
            <img src="https://example.com/path/to/image.jpg?v=123&size=large" />
            <img src="../images/logo.png" alt="Company logo" />
          </body>
        </html>
      `;
      
      mockFetchResponse(html);
      
      const results = await auditor.audit('https://example.com', mockAbortController.signal);
      
      expect(results).toHaveLength(2);
      
      // Check filename extraction from complex URL
      const missingAltResult = results.find(r => r.type === AuditType.IMAGE_MISSING_ALT);
      expect(missingAltResult?.imageFilename).toBe('image.jpg');
      
      const withAltResult = results.find(r => r.type === AuditType.IMAGE_WITH_ALT);
      expect(withAltResult?.imageFilename).toBe('logo.png');
    });

    it('should handle pages with no images', async () => {
      const html = `
        <html>
          <body>
            <h1>No images here</h1>
            <p>Just text content</p>
          </body>
        </html>
      `;
      
      mockFetchResponse(html);
      
      const results = await auditor.audit('https://example.com', mockAbortController.signal);
      
      expect(results).toHaveLength(0);
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const results = await auditor.audit('https://example.com', mockAbortController.signal);
      
      expect(results).toHaveLength(0);
    });

    it('should handle abort signal', async () => {
      const html = '<html><body><img src="/test.jpg" /></body></html>';
      mockFetchResponse(html);
      
      // Abort the signal before audit
      mockAbortController.abort();
      
      const results = await auditor.audit('https://example.com', mockAbortController.signal);
      
      expect(results).toHaveLength(0);
    });

    it('should handle images with whitespace-only alt text', async () => {
      const html = `
        <html>
          <body>
            <img src="/image1.jpg" alt="   " />
            <img src="/image2.jpg" alt="\t\n" />
          </body>
        </html>
      `;
      
      mockFetchResponse(html);
      
      const results = await auditor.audit('https://example.com', mockAbortController.signal);
      
      // Both should be treated as missing alt text
      const missingAltResults = results.filter(r => r.type === AuditType.IMAGE_MISSING_ALT);
      expect(missingAltResults).toHaveLength(2);
    });
  });
});
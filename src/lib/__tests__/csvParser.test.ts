import { CSVParser } from '../csvParser';

describe('CSVParser', () => {
  describe('parseCSV', () => {
    it('should parse simple CSV with URLs', async () => {
      const csvContent = `https://example.com
https://test.com
https://demo.org`;
      
      const result = await CSVParser.parseCSV(csvContent);
      
      expect(result.urls).toEqual(['https://example.com', 'https://test.com', 'https://demo.org']);
      expect(result.errors).toEqual([]);
      expect(result.totalRows).toBe(3);
      expect(result.validUrls).toBe(3);
    });

    it('should handle CSV with header row', async () => {
      const csvContent = `URL,Description
https://example.com,Homepage
https://test.com,Test page`;
      
      const result = await CSVParser.parseCSV(csvContent);
      
      expect(result.urls).toEqual(['https://example.com', 'https://test.com']);
      expect(result.totalRows).toBe(2);
    });

    it('should handle quoted CSV fields', async () => {
      const csvContent = `"https://example.com","Homepage with, comma"
"https://test.com","Another page"`;
      
      const result = await CSVParser.parseCSV(csvContent);
      
      expect(result.urls).toEqual(['https://example.com', 'https://test.com']);
    });

    it('should remove duplicate URLs', async () => {
      const csvContent = `https://example.com
https://example.com
https://test.com`;
      
      const result = await CSVParser.parseCSV(csvContent);
      
      expect(result.urls).toEqual(['https://example.com', 'https://test.com']);
      expect(result.validUrls).toBe(2);
    });

    it('should handle empty CSV', async () => {
      const result = await CSVParser.parseCSV('');
      
      expect(result.urls).toEqual([]);
      expect(result.errors).toEqual(['CSV file is empty']);
      expect(result.totalRows).toBe(0);
    });

    it('should collect validation errors', async () => {
      const csvContent = `https://example.com
invalid-url
mailto:test@example.com
https://test.com`;
      
      const result = await CSVParser.parseCSV(csvContent);
      
      expect(result.urls).toEqual(['https://example.com', 'https://test.com']);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateURL', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://www.demo.gov',
        'https://site.edu/path'
      ];

      validUrls.forEach(url => {
        const result = CSVParser.validateURL(url);
        expect(result.isValid).toBe(true);
        expect(result.url).toBe(url);
      });
    });

    it('should add protocol to URLs without it', () => {
      const result = CSVParser.validateURL('www.example.com');
      expect(result.isValid).toBe(true);
      expect(result.url).toBe('https://www.example.com');
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        '',
        'not-a-url',
        'mailto:test@example.com',
        'ftp://example.com',
        'https://example.invalid'
      ];

      invalidUrls.forEach(url => {
        const result = CSVParser.validateURL(url);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should handle URLs with paths and parameters', () => {
      const url = 'https://example.com/path?param=value#section';
      const result = CSVParser.validateURL(url);
      
      expect(result.isValid).toBe(true);
      expect(result.url).toBe(url);
    });
  });

  describe('generateExampleCSV', () => {
    it('should generate valid example CSV', () => {
      const example = CSVParser.generateExampleCSV();
      
      expect(example).toContain('URL');
      expect(example).toContain('https://');
      expect(example.split('\n').length).toBeGreaterThan(1);
    });
  });
});
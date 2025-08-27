/**
 * Help System Component
 * Provides contextual help, tooltips, and guidance throughout the application
 */

'use client';

import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default: // top
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-gray-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-gray-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-gray-800';
      default: // top
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-gray-800';
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${getPositionClasses()}`}>
          <div className="bg-gray-800 text-white text-xs rounded-md px-3 py-2 max-w-xs whitespace-normal shadow-lg">
            {content}
          </div>
          <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />
        </div>
      )}
    </div>
  );
};

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  section?: 'overview' | 'csv-format' | 'audit-types' | 'results' | 'troubleshooting';
}

export const HelpModal: React.FC<HelpModalProps> = ({ 
  isOpen, 
  onClose, 
  section = 'overview' 
}) => {
  const [activeSection, setActiveSection] = useState(section);

  if (!isOpen) return null;

  const sections = {
    overview: {
      title: 'Getting Started',
      content: (
        <div className="space-y-4">
          <p>The Web Accessibility Auditor helps you identify common accessibility issues across multiple websites.</p>
          
          <h4 className="font-semibold text-gray-800">How it works:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Upload a CSV file containing URLs you want to audit</li>
            <li>Configure audit settings (concurrent requests, delays)</li>
            <li>Run the audit and monitor progress</li>
            <li>Review results and export findings</li>
          </ol>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h5 className="font-medium text-blue-800 mb-2">What gets audited:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Images missing alt text</li>
              <li>• Vague or inaccessible link text</li>
              <li>• Buttons without proper labels</li>
              <li>• Heading hierarchy issues</li>
              <li>• Table accessibility</li>
              <li>• Document links (PDFs, Office files)</li>
            </ul>
          </div>
        </div>
      )
    },
    'csv-format': {
      title: 'CSV File Format',
      content: (
        <div className="space-y-4">
          <p>Your CSV file should contain URLs in the first column. Here's what you need to know:</p>
          
          <h4 className="font-semibold text-gray-800">Requirements:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>First column must contain URLs</li>
            <li>URLs should include protocol (http:// or https://)</li>
            <li>One URL per row</li>
            <li>Headers are optional but recommended</li>
            <li>Additional columns will be ignored</li>
          </ul>

          <h4 className="font-semibold text-gray-800 mt-4">Example CSV:</h4>
          <div className="bg-gray-100 rounded-md p-3 font-mono text-sm">
            <div>URL,Description</div>
            <div>https://example.com,Homepage</div>
            <div>https://example.com/about,About Page</div>
            <div>https://example.com/contact,Contact Page</div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <h5 className="font-medium text-yellow-800 mb-2">Tips:</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Test with a small batch first (5-10 URLs)</li>
              <li>• Ensure URLs are publicly accessible</li>
              <li>• Avoid URLs that require authentication</li>
              <li>• Check for typos in URLs</li>
            </ul>
          </div>
        </div>
      )
    },
    'audit-types': {
      title: 'Audit Types Explained',
      content: (
        <div className="space-y-4">
          <p>Understanding what each audit type checks for:</p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-red-400 pl-4">
              <h4 className="font-semibold text-red-800">Critical Issues (Red)</h4>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                <li><strong>Images Missing Alt Text:</strong> Images without alternative text for screen readers</li>
                <li><strong>Inaccessible Links:</strong> Links with vague text like "click here" or "read more"</li>
                <li><strong>Inaccessible Buttons:</strong> Buttons without proper labels or aria-labels</li>
                <li><strong>Heading Hierarchy:</strong> Improper heading structure (skipping levels, multiple h1s)</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-semibold text-yellow-800">Review Needed (Yellow)</h4>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                <li><strong>PDF Links:</strong> Links to PDF documents that may need accessibility review</li>
                <li><strong>Office File Links:</strong> Links to Word, Excel, PowerPoint files</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
              <h4 className="font-semibold text-blue-800">Informational (Blue)</h4>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                <li><strong>Images With Alt Text:</strong> Images that have alternative text (good!)</li>
                <li><strong>Table Information:</strong> Details about table structure and headers</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    results: {
      title: 'Understanding Results',
      content: (
        <div className="space-y-4">
          <p>How to interpret and act on your audit results:</p>
          
          <h4 className="font-semibold text-gray-800">Result Categories:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Red categories:</strong> Issues that need immediate attention</li>
            <li><strong>Yellow categories:</strong> Items that should be reviewed</li>
            <li><strong>Blue categories:</strong> Informational or positive findings</li>
          </ul>

          <h4 className="font-semibold text-gray-800 mt-4">Using Filters:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Search by URL or issue details</li>
            <li>Filter by specific issue types</li>
            <li>Show only errors to focus on critical issues</li>
            <li>Sort by URL, issue type, or discovery order</li>
          </ul>

          <h4 className="font-semibold text-gray-800 mt-4">Next Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Export results to CSV for sharing with your team</li>
            <li>Prioritize red (critical) issues first</li>
            <li>Review yellow (document) links for accessibility</li>
            <li>Use the detailed information to locate and fix issues</li>
            <li>Re-run audits after making fixes to verify improvements</li>
          </ol>

          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <h5 className="font-medium text-green-800 mb-2">Pro Tips:</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Focus on high-traffic pages first</li>
              <li>• Create templates for common fixes</li>
              <li>• Set up regular audits to catch new issues</li>
              <li>• Share results with content creators and developers</li>
            </ul>
          </div>
        </div>
      )
    },
    troubleshooting: {
      title: 'Troubleshooting',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Common Issues:</h4>
          
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-gray-700">CSV Upload Fails</h5>
              <ul className="text-sm text-gray-600 list-disc list-inside ml-4">
                <li>Check file format is .csv</li>
                <li>Ensure first column contains URLs</li>
                <li>Verify URLs include http:// or https://</li>
                <li>Try with a smaller file first</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-700">Audit Errors</h5>
              <ul className="text-sm text-gray-600 list-disc list-inside ml-4">
                <li>URLs may be inaccessible or require authentication</li>
                <li>Server may be blocking automated requests</li>
                <li>Network timeouts on slow-loading pages</li>
                <li>Try reducing concurrent requests in settings</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-700">Slow Performance</h5>
              <ul className="text-sm text-gray-600 list-disc list-inside ml-4">
                <li>Reduce concurrent requests (try 2-3)</li>
                <li>Increase delay between requests</li>
                <li>Audit smaller batches of URLs</li>
                <li>Check your internet connection</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-700">Missing Results</h5>
              <ul className="text-sm text-gray-600 list-disc list-inside ml-4">
                <li>Some pages may not have the issues being checked</li>
                <li>JavaScript-heavy sites may not render properly</li>
                <li>Check if URLs redirect to different pages</li>
                <li>Verify URLs are publicly accessible</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h5 className="font-medium text-red-800 mb-2">Need More Help?</h5>
            <p className="text-sm text-red-700">
              If you continue to experience issues, try auditing a small sample of URLs first, 
              or check the browser console for detailed error messages.
            </p>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Help & Documentation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close help modal"
          >
            ×
          </button>
        </div>
        
        <div className="flex h-full max-h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {Object.entries(sections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key as any)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === key
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {sections[activeSection].title}
            </h3>
            <div className="prose prose-sm max-w-none">
              {sections[activeSection].content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HelpButtonProps {
  section?: 'overview' | 'csv-format' | 'audit-types' | 'results' | 'troubleshooting';
  className?: string;
  variant?: 'icon' | 'text' | 'button';
}

export const HelpButton: React.FC<HelpButtonProps> = ({ 
  section = 'overview', 
  className = '',
  variant = 'icon'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buttonContent = {
    icon: '?',
    text: 'Help',
    button: 'Get Help'
  };

  const buttonClasses = {
    icon: 'w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center hover:bg-blue-200 transition-colors',
    text: 'text-blue-600 hover:text-blue-800 underline text-sm',
    button: 'px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors'
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${buttonClasses[variant]} ${className}`}
        aria-label={`Get help about ${section}`}
      >
        {buttonContent[variant]}
      </button>
      
      <HelpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={section}
      />
    </>
  );
};

export const ExampleCSVDownload: React.FC = () => {
  const generateExampleCSV = () => {
    const csvContent = `URL,Description
https://example.com,Homepage
https://example.com/about,About Page
https://example.com/contact,Contact Page
https://example.com/products,Products Page
https://example.com/blog,Blog Page`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'example-urls.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={generateExampleCSV}
      className="text-blue-600 hover:text-blue-800 underline text-sm"
    >
      Download Example CSV
    </button>
  );
};
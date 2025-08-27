# Web Accessibility Auditor

A comprehensive web accessibility auditing tool built with Next.js 15 that analyzes websites for common accessibility issues and provides detailed reports for remediation.

## 🌟 Overview

The Web Accessibility Auditor is a modern, production-ready application that helps developers and accessibility professionals identify and fix accessibility issues across multiple websites. Upload a CSV file with URLs, configure your audit settings, and get detailed reports on accessibility compliance.

### ✨ Key Features

- **📊 Comprehensive Auditing**: Analyzes 6+ types of accessibility issues
- **📁 Batch Processing**: Upload CSV files with multiple URLs for bulk auditing
- **⚡ Performance Optimized**: Virtual scrolling, debounced filtering, and memory management
- **🎯 Real-time Progress**: Live progress tracking with pause/resume functionality
- **📈 Detailed Reports**: Categorized results with filtering and sorting options
- **💾 Export Functionality**: Download results as CSV for offline analysis
- **🔄 Automatic Navigation**: Smart tab switching when audits complete
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🔍 What It Audits

The tool performs comprehensive accessibility analysis including:

### 🖼️ **Image Accessibility**
- Missing alt text on images
- Quality assessment of existing alt text
- Image filename extraction and analysis

### 🔗 **Link Accessibility** 
- Vague link text detection ("click here", "read more", etc.)
- Raw URL detection in page content
- Link context and target analysis

### 🔘 **Button & Form Accessibility**
- Missing labels on buttons and form inputs
- Icon-only button detection
- ARIA label and title attribute analysis

### 📝 **Heading Hierarchy**
- Proper heading sequence validation (h1-h6)
- Detection of skipped heading levels
- Heading structure analysis

### 📋 **Table Accessibility**
- Missing table captions and headers
- Row and column header detection
- Table structure compliance

### 📄 **Document Links**
- PDF and Office document link detection
- Document accessibility warnings
- File type identification

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-accessibility-auditor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### 📁 CSV File Format

Upload a CSV file with URLs in the first column:

```csv
URL
https://example.com
https://another-site.com
https://third-website.org
```

**Requirements:**
- First column should contain URLs (headers optional)
- URLs must include protocol (http:// or https://)
- One URL per row
- Additional columns are ignored

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode

# Analysis
npm run lint         # Run ESLint
npm run analyze      # Analyze bundle size
```

## 🏗️ Architecture

### **Tech Stack**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + useReducer
- **Testing**: Jest + React Testing Library
- **Build Tools**: Webpack with bundle analyzer

### **Key Components**

```
src/
├── components/          # React components
│   ├── AccessibilityAuditorApp.tsx    # Main app component
│   ├── FileUpload.tsx                 # CSV file upload
│   ├── AuditControlPanel.tsx          # Audit configuration
│   ├── ProgressTracker.tsx            # Real-time progress
│   ├── ResultsDisplay.tsx             # Results visualization
│   ├── ResultsFilter.tsx              # Filtering & sorting
│   └── VirtualizedResultsList.tsx     # Performance optimization
├── lib/                 # Core business logic
│   ├── auditEngine.ts                 # Main audit orchestrator
│   ├── auditors/                      # Individual audit modules
│   ├── csvParser.ts                   # CSV processing
│   └── rateLimiter.ts                 # Request management
├── hooks/               # Custom React hooks
│   ├── useAuditEngine.ts              # Audit state management
│   ├── useResultsFilter.ts            # Results filtering logic
│   ├── useDebounce.ts                 # Performance optimization
│   └── usePerformanceMonitor.ts       # Memory management
├── context/             # React Context providers
└── types/               # TypeScript definitions
```

## ⚡ Performance Features

### **Optimizations Implemented**
- **Virtual Scrolling**: Efficiently renders large result sets (>50 items)
- **Debounced Filtering**: 300ms delay prevents excessive re-renders
- **Memory Management**: Automatic cleanup for large datasets (>1000 results)
- **Bundle Optimization**: ~123KB first load JS with code splitting
- **Request Management**: Configurable rate limiting and concurrent requests

### **Production Ready**
- Compression enabled
- Security headers configured
- Image optimization (WebP, AVIF)
- Bundle analysis tools included

## 🧪 Testing

The application includes comprehensive test coverage:

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test -- --testPathPattern=performance
npm run test -- --testPathPattern=auto-tab-switching
```

**Test Coverage:**
- Unit tests for all major components
- Integration tests for complete workflows
- Performance tests for optimization features
- Auto-tab-switching functionality tests

## 🔧 Configuration

### **Audit Settings**
- **Concurrent Requests**: 1-10 simultaneous requests
- **Request Delay**: 500ms-5000ms between requests
- **Timeout Duration**: 5-30 seconds per request

### **Environment Variables**
```bash
# Optional: Set custom timeout for requests
NEXT_PUBLIC_REQUEST_TIMEOUT=10000

# Optional: Enable debug logging
NEXT_PUBLIC_DEBUG=true
```

## 📊 Bundle Analysis

Analyze your bundle size:

```bash
npm run analyze
```

This generates a detailed report showing:
- Bundle composition
- Largest dependencies
- Optimization opportunities

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
# Deploy to Vercel platform
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Static Export**
```bash
# Add to next.config.ts
output: 'export'

npm run build
# Deploy the 'out' directory
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- **WCAG Guidelines**: [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **WebAIM**: [Web Accessibility In Mind](https://webaim.org/)
- **MDN Accessibility**: [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- **Next.js Documentation**: [Next.js Docs](https://nextjs.org/docs)

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check existing documentation
- Review the test suite for usage examples

---

**Built with ❤️ for web accessibility**

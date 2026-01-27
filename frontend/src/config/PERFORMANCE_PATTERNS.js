/**
 * Performance Optimization Patterns (Reference)
 * This file contains best practices and code examples for performance
 */

// ============================================================================
// 1. CODE SPLITTING PATTERNS
// ============================================================================

// ✅ Good: Lazy load pages
// const DashboardPage = lazy(() => import('@/pages/DashboardPage'))

// ❌ Bad: Load all pages upfront
// import DashboardPage from '@/pages/DashboardPage'
// import FinancialReports from '@/pages/FinancialReports'
// import ChartOfAccounts from '@/pages/ChartOfAccounts'

// ============================================================================
// 2. CACHING PATTERNS
// ============================================================================

export const cachingPatterns = {
  // Server-side caching example (Node.js)
  redisCache: `
    const redis = new Redis()
    
    app.get('/api/data', async (req, res) => {
      const cached = await redis.get('cache_key')
      if (cached) return res.json(JSON.parse(cached))
      
      const data = await fetchData()
      await redis.setex('cache_key', 300, JSON.stringify(data))
      return res.json(data)
    })
  `,

  // HTTP caching headers
  httpHeaders: {
    'Cache-Control': 'public, max-age=3600', // 1 hour
    'ETag': 'W/"123abc"', // For conditional requests
    'Last-Modified': 'Wed, 19 Jan 2026 10:00:00 GMT'
  }
}

// ============================================================================
// 3. IMAGE OPTIMIZATION
// ============================================================================

export const imageOptimizationPatterns = {
  // WebP with fallback
  responsive: `
    <picture>
      <source srcSet="image.webp" type="image/webp" />
      <source srcSet="image.jpg" type="image/jpeg" />
      <img src="image.jpg" alt="Description" loading="lazy" />
    </picture>
  `,

  // Responsive sizes
  srcset: 'image-320w.jpg 320w, image-640w.jpg 640w, image-1280w.jpg 1280w'
}

// ============================================================================
// 4. DATABASE OPTIMIZATION
// ============================================================================

export const databaseOptimizationPatterns = {
  // ✅ Create indexes on frequently filtered columns
  indexes: [
    'CREATE INDEX idx_entries_date ON journal_entries(date)',
    'CREATE INDEX idx_entries_status ON journal_entries(status)',
    'CREATE INDEX idx_entries_company ON journal_entries(company_id)',
    'CREATE INDEX idx_accounts_company ON chart_of_accounts(company_id)'
  ],

  // ✅ Pagination instead of loading all records
  pagination: `
    SELECT * FROM entries 
    WHERE company_id = ? 
    ORDER BY date DESC 
    LIMIT 20 OFFSET 0
  `,

  // ✅ Use connection pooling (already in Sequelize)
  pooling: {
    min: 2,
    max: 10,
    acquire: 30000,
    idle: 10000
  }
}

// ============================================================================
// 5. BUNDLE SIZE OPTIMIZATION
// ============================================================================

export const bundleSizeOptimization = {
  // vite.config.js configuration
  config: `
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-core': ['react', 'react-dom'],
            'vendor-charts': ['recharts'],
            'api': ['axios']
          }
        }
      }
    }
  `,

  // Target bundle sizes
  targets: {
    'main.js': '< 100 KB',
    'vendor-core.js': '< 150 KB',
    'vendor-charts.js': '< 80 KB',
    'total': '< 300 KB (gzipped)'
  }
}

// ============================================================================
// 6. COMPRESSION
// ============================================================================

export const compressionPatterns = {
  // Node.js middleware
  nodeJs: `
    import compression from 'compression'
    app.use(compression({ threshold: 1024 }))
  `,

  // Nginx configuration (production)
  nginx: `
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
    gzip_comp_level 6;
  `
}

// ============================================================================
// 7. RATE LIMITING & SECURITY
// ============================================================================

export const rateLimitingPatterns = {
  // Express rate limit
  middleware: `
    const rateLimit = require('express-rate-limit')
    
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Trop de requêtes'
    })
    
    app.use('/api/', limiter)
  `,

  // Per-endpoint limits
  authLimiter: {
    windowMs: '15 minutes',
    maxRequests: 5,
    message: 'Trop de tentatives de connexion'
  }
}

// ============================================================================
// 8. LIGHTHOUSE OPTIMIZATION CHECKLIST
// ============================================================================

export const lighthouseChecklist = {
  performance: [
    '✅ Code splitting (lazy load pages)',
    '✅ Minification (JS/CSS)',
    '✅ Image optimization (WebP)',
    '✅ Remove unused code',
    '✅ Compression (Gzip)',
    '✅ Caching (browser + server)',
    '✅ Optimize fonts'
  ],
  
  accessibility: [
    '✅ ARIA labels',
    '✅ Keyboard navigation',
    '✅ Color contrast',
    '✅ Alt text for images',
    '✅ Form labels'
  ],

  bestPractices: [
    '✅ HTTPS enabled',
    '✅ No mixed content',
    '✅ Security headers',
    '✅ No console errors',
    '✅ Valid HTML/CSS'
  ],

  seo: [
    '✅ Meta tags',
    '✅ Responsive design',
    '✅ Mobile-friendly',
    '✅ Structured data',
    '✅ Fast load time'
  ]
}

// ============================================================================
// 9. MONITORING & ANALYTICS
// ============================================================================

export const performanceMonitoring = {
  // Track Web Vitals
  vitals: `
    import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
    
    getCLS(metric => console.log('CLS', metric))
    getFID(metric => console.log('FID', metric))
    getFCP(metric => console.log('FCP', metric))
    getLCP(metric => console.log('LCP', metric))
    getTTFB(metric => console.log('TTFB', metric))
  `,

  // Response time logging
  timing: `
    const startTime = Date.now()
    // ... operation ...
    const duration = Date.now() - startTime
    console.log(\`Operation took \${duration}ms\`)
  `
}

// ============================================================================
// 10. DEPLOYMENT OPTIMIZATION
// ============================================================================

export const deploymentOptimizations = {
  // Production build command
  build: 'npm run build',

  // Environment variables
  env: {
    'VITE_API_URL': 'https://api.spofe.com',
    'NODE_ENV': 'production'
  },

  // Cache strategy for CDN
  cacheHeaders: {
    'static-assets': 'public, max-age=31536000, immutable', // 1 year
    'html': 'public, max-age=3600, must-revalidate', // 1 hour
    'api': 'private, max-age=300, must-revalidate' // 5 minutes
  }
}

export default {
  cachingPatterns,
  imageOptimizationPatterns,
  databaseOptimizationPatterns,
  bundleSizeOptimization,
  compressionPatterns,
  rateLimitingPatterns,
  lighthouseChecklist,
  performanceMonitoring,
  deploymentOptimizations
}

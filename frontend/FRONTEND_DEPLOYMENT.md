# 🚀 Frontend Deployment Guide - SPOFE v1.0

## Table of Contents
- [Deployment Overview](#deployment-overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Building for Production](#building-for-production)
- [Environment Variables](#environment-variables)
- [Hosting Options](#hosting-options)
- [Vercel Deployment](#vercel-deployment)
- [Traditional Server Deployment](#traditional-server-deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Deployment Overview

The SPOFE frontend is a static Single Page Application (SPA) built with Vite.

### Deployment Flow

```
Code Push → GitHub Actions → Build → Tests → Deploy → Monitor
```

### Deployment Targets

- **Preview**: Vercel (on PR)
- **Staging**: Vercel (develop branch)
- **Production**: Vercel (main branch)

## Pre-Deployment Checklist

Before deploying to production:

### Code Quality
- [ ] All tests passing: `npm run test -- --run`
- [ ] No linting errors: `npm run lint`
- [ ] E2E tests passing: `npm run e2e:headless`
- [ ] Code review completed
- [ ] Tests coverage > 80%

### Configuration
- [ ] Environment variables set correctly
- [ ] API URL points to production backend
- [ ] No console errors in build
- [ ] No hardcoded secrets or API keys
- [ ] Favicon updated
- [ ] Page titles set correctly

### Performance
- [ ] Build size checked: `npm run build -- --stats`
- [ ] No unused dependencies
- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] Cache headers configured

### Security
- [ ] CSP headers set
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] XSS protection enabled
- [ ] Dependencies up to date

### Documentation
- [ ] CHANGELOG updated
- [ ] Deployment notes documented
- [ ] Rollback plan prepared
- [ ] Team notified

## Building for Production

### Manual Build

```bash
# Install dependencies
npm install

# Build optimized bundle
npm run build

# Output: dist/
```

### Build Process

1. **Minification**: Code compressed with terser
2. **Bundling**: Assets combined and split by route
3. **Optimization**: CSS extracted, images encoded
4. **Source Maps**: Generated for debugging (optional)

### Build Output

```
dist/
├── index.html          # Entry point
├── assets/
│   ├── app-HASH.js     # Main app code
│   ├── vendor-HASH.js  # Dependencies
│   └── style-HASH.css  # Global styles
└── manifest.json       # Import map
```

### Build Size Analysis

```bash
# Generate size report
npm run build -- --stats

# View interactive visualization
open dist/stats.html
```

## Environment Variables

### Required Variables

```env
# Production API endpoint
VITE_API_URL=https://api.spofe.com

# App metadata
VITE_APP_NAME=SPOFE
VITE_APP_VERSION=1.0.0
```

### Setting Variables in CI/CD

**GitHub Secrets** (`.github/workflows/frontend.yml`):

```yaml
env:
  VITE_API_URL: https://api.spofe.com
```

**Vercel Dashboard**:
1. Settings → Environment Variables
2. Add VITE_API_URL = https://api.spofe.com
3. Apply to Production

### Building with Variables

```bash
# Build with environment variables
VITE_API_URL=https://api.spofe.com npm run build

# Verify variables in build
grep "api.spofe.com" dist/assets/*.js
```

## Hosting Options

### Option 1: Vercel (Recommended)

**Advantages:**
- ✅ Zero-config deployment
- ✅ Automatic SSL/TLS
- ✅ Global CDN
- ✅ Preview URLs for PRs
- ✅ Environmental variables UI
- ✅ Free tier available

**Setup**: See [Vercel Deployment](#vercel-deployment)

### Option 2: GitHub Pages

**Advantages:**
- ✅ Free hosting
- ✅ Git integration
- ✅ No external account needed

**Setup:**

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Update package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

### Option 3: Traditional Server (Nginx/Apache)

**Advantages:**
- ✅ Full control
- ✅ Custom server config
- ✅ On-premise option

**Setup**: See [Traditional Server Deployment](#traditional-server-deployment)

### Option 4: Docker

**Advantages:**
- ✅ Containerized
- ✅ Consistent environments
- ✅ Easy scaling

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Vercel Deployment

### Automatic Deployment (CI/CD)

Configured in `.github/workflows/frontend.yml`:

```yaml
- name: Deploy to Vercel (Production)
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    working-directory: ./frontend
    prod: true
```

### Manual Deployment

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login

```bash
vercel login
# Opens browser to authenticate
```

#### 3. Deploy

```bash
# Deploy to staging
cd frontend
vercel

# Deploy to production
vercel --prod
```

#### 4. Configure in Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set environment variables
4. Deploy

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "env": {
    "VITE_API_URL": "@api_url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

### Preview URLs

- **Staging**: https://spofe-frontend-staging.vercel.app
- **Production**: https://spofe.vercel.app
- **PR Preview**: https://spofe-frontend-pr-123.vercel.app

## Traditional Server Deployment

### Using Nginx

**1. Build the app**
```bash
npm run build
```

**2. Upload to server**
```bash
scp -r dist/ user@server:/var/www/spofe/
```

**3. Configure Nginx**

Create `/etc/nginx/sites-available/spofe`:

```nginx
server {
    listen 80;
    server_name spofe.com www.spofe.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name spofe.com www.spofe.com;
    
    ssl_certificate /etc/letsencrypt/live/spofe.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/spofe.com/privkey.pem;
    
    root /var/www/spofe/dist;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|gif|ico|woff2|woff)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing - send all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (optional)
    location /api/ {
        proxy_pass https://api.spofe.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

**4. Enable site**
```bash
sudo ln -s /etc/nginx/sites-available/spofe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**5. SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d spofe.com -d www.spofe.com
```

### Using Apache

**1. Upload files**
```bash
scp -r dist/* user@server:/var/www/spofe/
```

**2. Configure `.htaccess`**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Cache static files
  <FilesMatch "\.(js|css|png|jpg|gif|ico|woff2)$">
    Header set Cache-Control "public, max-age=31536000"
  </FilesMatch>
  
  # SPA routing
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

**3. Enable modules**
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl reload apache2
```

## Post-Deployment

### Verification

```bash
# Test deployed site
curl -I https://spofe.com

# Check response headers
curl -I -H "User-Agent: Mozilla/5.0" https://spofe.com

# Verify API connection
curl https://spofe.com/api/health
```

### Testing

```bash
# Test login flow
# 1. Open https://spofe.com
# 2. Enter credentials
# 3. Verify dashboard loads

# Check performance
# DevTools → Network tab
# Should see compressed assets, fast load times
```

### Monitoring

- Set up error tracking (Sentry)
- Monitor API errors
- Track user analytics
- Set up uptime monitoring

## Monitoring

### Health Checks

```javascript
// Periodic health check
setInterval(async () => {
  try {
    const response = await api.get('/health')
    console.log('API Health:', response.status)
  } catch (error) {
    console.error('API Down:', error.message)
    // Alert team
  }
}, 5 * 60 * 1000) // Every 5 minutes
```

### Error Tracking (Sentry)

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})

export default Sentry.withProfiler(App)
```

### Analytics

Add Google Analytics or similar:

```javascript
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function usePageTracking() {
  const location = useLocation()
  
  useEffect(() => {
    // Track page view
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
      })
    }
  }, [location])
}
```

## Troubleshooting

### 404 Errors on Refresh

**Issue**: Page goes to 404 when refreshing at `/accounts`

**Solution**: Configure server to serve `index.html` for all routes

**Vercel** (automatic)
**Nginx**: `try_files $uri /index.html`
**Apache**: See `.htaccess` above

### API Connection Errors

**Issue**: "Failed to fetch" errors

**Solutions**:
1. Check VITE_API_URL is correct
2. Verify backend is running
3. Check CORS headers on backend
4. Check browser Network tab

### Blank Page on Load

**Issue**: Page loads but shows nothing

**Solutions**:
1. Check browser console for JavaScript errors
2. Check Network tab for failed requests
3. Verify files were uploaded correctly
4. Clear browser cache

### Slow Load Times

**Solutions**:
1. Check build size: `npm run build -- --stats`
2. Enable gzip compression on server
3. Use CDN for static assets
4. Optimize images
5. Enable caching headers

## Rollback

### If Deployment Fails

**Option 1: Vercel Dashboard**
1. Go to Deployments
2. Select previous deployment
3. Click Promote to Production

**Option 2: Manual Rollback**
```bash
# Deploy previous version
git checkout previous-commit
npm run build
vercel --prod
```

## Deployment Commands

```bash
# Build for production
npm run build

# Verify build locally
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to GitHub Pages
npm run deploy

# Check deployment
curl -I https://spofe.com
```

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Nginx SPA Config](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html)
- [Let's Encrypt](https://letsencrypt.org)

---

**Last Updated**: January 2024
**Version**: 1.0.0

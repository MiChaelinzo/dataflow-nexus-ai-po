# 🚀 Deployment Guide - Alternative Hosting Options

This guide provides multiple deployment options for hosting the Analytics Intelligence Platform beyond github.app, ensuring you have reliable backup URLs for interviews and presentations.

## 📋 Table of Contents
- [Quick Deployment Options](#quick-deployment-options)
- [Option 1: Netlify (Recommended)](#option-1-netlify-recommended)
- [Option 2: Vercel](#option-2-vercel)
- [Option 3: GitHub Pages](#option-3-github-pages)
- [Option 4: Cloudflare Pages](#option-4-cloudflare-pages)
- [Build & Export](#build--export)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Deployment Options

### Fastest Options (5-10 minutes):
1. **Netlify** - Drag & drop or GitHub integration
2. **Vercel** - One-click GitHub deployment
3. **Cloudflare Pages** - GitHub integration with global CDN

### Traditional Option (15-20 minutes):
4. **GitHub Pages** - Free hosting on github.io domain

---

## Option 1: Netlify (Recommended)

### Why Netlify?
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Instant rollbacks
- ✅ Deploy previews for branches

### Method A: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select your repository
   - Use these build settings:
     ```
     Build command: npm run build
     Publish directory: dist
     ```
   - Click "Deploy site"

3. **Your Site is Live!**
   - You'll get a URL like: `https://your-project-name.netlify.app`
   - Can customize to: `https://analytics-intelligence.netlify.app`

### Method B: Manual Deploy (No Git Required)

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify Drop**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop your `dist` folder
   - Get instant live URL

### Netlify Configuration File

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

---

## Option 2: Vercel

### Why Vercel?
- ✅ Excellent performance
- ✅ Edge network
- ✅ GitHub integration
- ✅ Automatic preview deployments

### Deployment Steps

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration
   - Click "Deploy"

3. **Your Site is Live!**
   - URL: `https://your-project.vercel.app`
   - Can add custom domain

### Vercel Configuration File

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Option 3: GitHub Pages

### Why GitHub Pages?
- ✅ Free hosting on *.github.io
- ✅ Integrated with GitHub
- ✅ Simple setup

### Deployment Steps

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   Add these scripts:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/repository-name"
   }
   ```

3. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/repository-name/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages
   - Save

6. **Your Site is Live!**
   - URL: `https://yourusername.github.io/repository-name`

### GitHub Actions Workflow (Alternative)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

---

## Option 4: Cloudflare Pages

### Why Cloudflare Pages?
- ✅ Global CDN
- ✅ Fast performance
- ✅ Free tier
- ✅ GitHub integration

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Cloudflare"
   git push origin main
   ```

2. **Deploy on Cloudflare**
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Connect your GitHub account
   - Select repository
   - Build settings:
     ```
     Framework preset: Vite
     Build command: npm run build
     Build output directory: dist
     ```
   - Click "Save and Deploy"

3. **Your Site is Live!**
   - URL: `https://your-project.pages.dev`
   - Can add custom domain

---

## 🔧 Build & Export

### Build for Production

```bash
# Install dependencies
npm install

# Build the project
npm run build

# The output will be in the 'dist' folder
```

### What Gets Built?
- `dist/` folder contains:
  - `index.html` - Entry point
  - `assets/` - All JavaScript, CSS, and assets
  - Static files ready for hosting

### Preview Production Build Locally

```bash
npm run preview
```

This starts a local server at `http://localhost:4173` to test the production build.

---

## 🔐 Environment Variables

If your app uses environment variables, set them in your hosting platform:

### Netlify
- Dashboard → Site settings → Environment variables
- Add variables with names starting with `VITE_`

### Vercel
- Dashboard → Settings → Environment Variables
- Add variables with names starting with `VITE_`

### Example Variables
```env
VITE_APP_NAME=Analytics Intelligence Platform
VITE_API_URL=https://api.example.com
```

**Note:** This Spark app uses the built-in `spark.kv` persistence and `spark.user()` API, so no external environment variables are required for basic functionality.

---

## 🎥 Alternative: Static Export for Any Host

If you want maximum flexibility to host anywhere (AWS S3, your own server, etc.):

### 1. Build the Project
```bash
npm run build
```

### 2. Test Locally
```bash
npm run preview
```

### 3. Upload the `dist` folder
Upload the entire `dist` folder to any static hosting service:
- AWS S3 + CloudFront
- Azure Static Web Apps
- Firebase Hosting
- Any web server (Apache, Nginx)

### 4. Server Configuration
Ensure your server redirects all routes to `index.html` for React Router to work.

**Nginx Example:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 404 Errors on Routes
- Ensure your hosting platform redirects all routes to `index.html`
- Add redirect rules (see examples above)

### Assets Not Loading
- Check `base` path in `vite.config.ts`
- For GitHub Pages: `base: '/repo-name/'`
- For root domains: `base: '/'`

### Large Build Size
```bash
# Analyze bundle size
npm run build -- --mode production
```

---

## 📊 Recommended Setup for Hackathon

For maximum reliability during interviews/demos:

1. **Primary URL**: github.app (Spark hosting)
2. **Backup URL #1**: Netlify (instant deploy)
3. **Backup URL #2**: Vercel (instant deploy)
4. **Backup Plan**: Local `npm run dev` with ngrok/localhost

### Quick Netlify Deploy (2 minutes)
```bash
npm run build
# Drag dist folder to app.netlify.com/drop
```

### Emergency Local Demo with Public URL
```bash
# Install ngrok (if not installed)
npm install -g ngrok

# Start local server
npm run dev

# In another terminal, expose to internet
ngrok http 5173
```

---

## 📝 Submission Checklist

For your Devpost submission, include:

- ✅ Primary deployment URL (github.app or custom)
- ✅ Backup deployment URL (Netlify/Vercel)
- ✅ GitHub repository URL
- ✅ Build instructions in README
- ✅ Demo video (YouTube/Vimeo)
- ✅ Screenshots of live site

---

## 🎯 Quick Reference

| Platform | Speed | Difficulty | URL Format |
|----------|-------|------------|------------|
| Netlify | ⚡ Fast | 😊 Easy | `*.netlify.app` |
| Vercel | ⚡ Fast | 😊 Easy | `*.vercel.app` |
| Cloudflare | ⚡ Fast | 😊 Easy | `*.pages.dev` |
| GitHub Pages | 🐌 Medium | 🤔 Medium | `*.github.io` |
| Manual Upload | ⚡ Instant | 😊 Very Easy | Custom domain |

---

## 💡 Pro Tips

1. **Test Before Submission**: Always test your deployed URLs in an incognito window
2. **Multiple Backups**: Deploy to 2-3 platforms for redundancy
3. **Custom Domain**: Consider a custom domain for professional appearance
4. **Monitor Uptime**: Check your deployment 1 hour before your interview
5. **Screen Recording**: Always have a backup video of the working app

---

## 🆘 Need Help?

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vite Deployment**: [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy)

---

**Ready to Deploy?** Start with Netlify's drag-and-drop option for the fastest backup URL!

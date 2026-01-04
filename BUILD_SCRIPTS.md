# 🔧 Build & Deployment Scripts

This document provides ready-to-use scripts for building and deploying your Analytics Intelligence Platform.

---

## 📦 Build Scripts

### Basic Build
```bash
npm run build
```

### Clean Build (Recommended)
```bash
# Remove old files and build fresh
rm -rf dist node_modules/.vite
npm run build
```

### Full Clean Build
```bash
# Nuclear option - reinstall everything
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

---

## 🚀 Quick Deploy Scripts

### Netlify Drop Deploy (Fastest - 2 minutes)

```bash
#!/bin/bash
# deploy-netlify-drop.sh

echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📦 dist folder is ready"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Open https://app.netlify.com/drop"
    echo "2. Drag and drop the 'dist' folder"
    echo "3. Get your live URL!"
    echo ""
    echo "💡 Your dist folder is located at: $(pwd)/dist"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi
```

**Usage:**
```bash
chmod +x deploy-netlify-drop.sh
./deploy-netlify-drop.sh
```

### Netlify CLI Deploy

```bash
#!/bin/bash
# deploy-netlify-cli.sh

echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Install Netlify CLI if not present
    if ! command -v netlify &> /dev/null; then
        echo "📥 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    echo "✅ Deployment complete!"
else
    echo "❌ Build failed"
    exit 1
fi
```

**Usage:**
```bash
chmod +x deploy-netlify-cli.sh
./deploy-netlify-cli.sh
```

### Vercel Deploy

```bash
#!/bin/bash
# deploy-vercel.sh

echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
        echo "📥 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "✅ Deployment complete!"
else
    echo "❌ Build failed"
    exit 1
fi
```

**Usage:**
```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

---

## 🧪 Test Scripts

### Local Production Preview
```bash
#!/bin/bash
# preview-production.sh

echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Starting preview server..."
    echo "📍 Open http://localhost:4173 in your browser"
    npm run preview
else
    echo "❌ Build failed"
    exit 1
fi
```

### Test All Deployments
```bash
#!/bin/bash
# test-deployments.sh

echo "🧪 Testing all deployment URLs..."
echo ""

# Add your URLs here
PRIMARY_URL="https://your-app.github.app"
NETLIFY_URL="https://your-app.netlify.app"
VERCEL_URL="https://your-app.vercel.app"

echo "Testing primary URL..."
if curl -s -o /dev/null -w "%{http_code}" "$PRIMARY_URL" | grep -q "200"; then
    echo "✅ Primary URL is up: $PRIMARY_URL"
else
    echo "❌ Primary URL is down: $PRIMARY_URL"
fi
echo ""

echo "Testing Netlify backup..."
if curl -s -o /dev/null -w "%{http_code}" "$NETLIFY_URL" | grep -q "200"; then
    echo "✅ Netlify is up: $NETLIFY_URL"
else
    echo "⚠️  Netlify may be down: $NETLIFY_URL"
fi
echo ""

echo "Testing Vercel backup..."
if curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL" | grep -q "200"; then
    echo "✅ Vercel is up: $VERCEL_URL"
else
    echo "⚠️  Vercel may be down: $VERCEL_URL"
fi
echo ""

echo "🏁 Tests complete!"
```

---

## 🔄 Update Scripts

### Update Dependencies
```bash
#!/bin/bash
# update-deps.sh

echo "📦 Updating dependencies..."

# Backup package-lock.json
cp package-lock.json package-lock.json.backup

# Update
npm update

# Test
echo "🧪 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Update successful!"
    rm package-lock.json.backup
else
    echo "❌ Update broke the build, rolling back..."
    mv package-lock.json.backup package-lock.json
    npm install
    exit 1
fi
```

---

## 🆘 Emergency Scripts

### Emergency Local Demo with Public URL
```bash
#!/bin/bash
# emergency-demo.sh

echo "🚨 Starting emergency local demo..."

# Install ngrok if needed
if ! command -v ngrok &> /dev/null; then
    echo "📥 Installing ngrok..."
    npm install -g ngrok
fi

# Start dev server in background
echo "🔨 Starting dev server..."
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Start ngrok
echo "🌐 Creating public URL with ngrok..."
echo "📍 Your public URL will appear below:"
echo ""
ngrok http 5173

# Cleanup on exit
trap "kill $DEV_PID" EXIT
```

**Usage:**
```bash
chmod +x emergency-demo.sh
./emergency-demo.sh
```

### Quick Fix Script
```bash
#!/bin/bash
# quick-fix.sh

echo "🔧 Running quick fix..."

# Clear caches
echo "🧹 Clearing caches..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf dist

# Reinstall
echo "📦 Reinstalling dependencies..."
npm install

# Build
echo "🔨 Building..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Quick fix successful!"
    echo "🌐 Testing with preview..."
    npm run preview
else
    echo "❌ Fix failed. Manual intervention needed."
    exit 1
fi
```

---

## 📊 Bundle Analysis Script

```bash
#!/bin/bash
# analyze-bundle.sh

echo "📊 Analyzing bundle size..."

# Build with analysis
npm run build -- --mode production

echo ""
echo "📁 Build output:"
du -sh dist
echo ""
echo "📦 Largest files in build:"
find dist -type f -exec du -h {} + | sort -rh | head -10
echo ""
echo "💡 Tips to reduce bundle size:"
echo "  - Remove unused dependencies"
echo "  - Use code splitting"
echo "  - Optimize images"
echo "  - Enable compression on hosting platform"
```

---

## 🎯 All-in-One Deploy Script

```bash
#!/bin/bash
# deploy-all.sh

set -e  # Exit on any error

echo "🚀 ALL-IN-ONE DEPLOYMENT SCRIPT"
echo "================================"
echo ""

# Clean build
echo "1️⃣  Cleaning previous builds..."
rm -rf dist node_modules/.vite
echo "✅ Clean complete"
echo ""

# Build
echo "2️⃣  Building project..."
npm run build
echo "✅ Build complete"
echo ""

# Test build
echo "3️⃣  Testing build..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build verification passed"
else
    echo "❌ Build verification failed"
    exit 1
fi
echo ""

# Show deployment options
echo "4️⃣  Ready to deploy! Choose option:"
echo ""
echo "A) Netlify Drop (manual)"
echo "   1. Open https://app.netlify.com/drop"
echo "   2. Drag the 'dist' folder"
echo ""
echo "B) Netlify CLI (automatic)"
read -p "   Deploy to Netlify now? (y/n): " deploy_netlify
if [ "$deploy_netlify" = "y" ]; then
    if command -v netlify &> /dev/null; then
        netlify deploy --prod --dir=dist
        echo "✅ Netlify deployment complete"
    else
        echo "⚠️  Netlify CLI not installed. Install with: npm install -g netlify-cli"
    fi
fi
echo ""

echo "C) Vercel (automatic)"
read -p "   Deploy to Vercel now? (y/n): " deploy_vercel
if [ "$deploy_vercel" = "y" ]; then
    if command -v vercel &> /dev/null; then
        vercel --prod
        echo "✅ Vercel deployment complete"
    else
        echo "⚠️  Vercel CLI not installed. Install with: npm install -g vercel"
    fi
fi
echo ""

echo "🎉 Deployment process complete!"
echo ""
echo "📁 Your dist folder is ready at: $(pwd)/dist"
echo "📄 Size: $(du -sh dist | cut -f1)"
echo ""
echo "💡 Next steps:"
echo "  - Test your deployed URLs"
echo "  - Update DEVPOST_SUBMISSION_GUIDE.md with URLs"
echo "  - Verify all features work"
```

**Usage:**
```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

---

## 📝 Package.json Scripts

Add these to your `package.json` for convenience:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist node_modules/.vite",
    "clean:all": "rm -rf dist node_modules/.vite node_modules package-lock.json",
    "rebuild": "npm run clean && npm install && npm run build",
    "deploy:netlify": "npm run build && netlify deploy --prod --dir=dist",
    "deploy:vercel": "npm run build && vercel --prod",
    "analyze": "npm run build -- --mode production && du -sh dist",
    "test:preview": "npm run build && npm run preview"
  }
}
```

**Usage:**
```bash
npm run rebuild      # Full clean rebuild
npm run deploy:netlify  # Deploy to Netlify
npm run deploy:vercel   # Deploy to Vercel
npm run analyze      # Check bundle size
```

---

## 🎯 Quick Reference

| Script | Purpose | Time |
|--------|---------|------|
| `npm run build` | Standard build | 30s |
| `npm run clean` | Clear caches | 5s |
| `npm run rebuild` | Full rebuild | 2m |
| `npm run preview` | Test production | 10s |
| `deploy-netlify-drop.sh` | Manual Netlify | 2m |
| `deploy-vercel.sh` | Auto Vercel | 3m |
| `emergency-demo.sh` | Ngrok public URL | 1m |

---

## 💡 Pro Tips

1. **Make scripts executable**: `chmod +x *.sh`
2. **Test before demo**: Run `deploy-all.sh` 24 hours before
3. **Keep scripts updated**: Add your actual URLs to test scripts
4. **Git commit scripts**: Include all scripts in your repository
5. **Document URLs**: Update docs with your deployed URLs

---

## 🆘 If Build Fails

Try in order:

```bash
# 1. Clear Vite cache
npm run clean
npm run build

# 2. Full clean rebuild
npm run rebuild

# 3. Nuclear option
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

---

**Ready to deploy?** Start with `deploy-all.sh` for guided deployment! 🚀

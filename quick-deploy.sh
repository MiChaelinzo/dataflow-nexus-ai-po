#!/bin/bash

# 🚀 Quick Deploy Script for Analytics Intelligence Platform
# This script builds your project and provides multiple deployment options

set -e  # Exit on error

echo "🚀 Analytics Intelligence Platform - Quick Deploy"
echo "=================================================="
echo ""

# Step 1: Clean and build
echo "🔨 Step 1: Building project..."
rm -rf dist node_modules/.vite 2>/dev/null || true
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Step 2: Show build info
echo "📊 Build Information:"
echo "   Location: $(pwd)/dist"
echo "   Size: $(du -sh dist | cut -f1)"
echo ""

# Step 3: Deployment options
echo "🌐 Deployment Options:"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Option 1: Netlify Drop (FASTEST - 2 minutes)                 ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║  1. Open: https://app.netlify.com/drop                        ║"
echo "║  2. Drag and drop the 'dist' folder                           ║"
echo "║  3. Get instant live URL!                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Option 2: Vercel                                              ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║  1. Go to: https://vercel.com/new                             ║"
echo "║  2. Import your GitHub repository                             ║"
echo "║  3. Click Deploy                                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Option 3: Cloudflare Pages                                    ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║  1. Go to: https://pages.cloudflare.com                       ║"
echo "║  2. Connect GitHub and select repository                      ║"
echo "║  3. Set build command: npm run build                          ║"
echo "║  4. Set output directory: dist                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if CLI tools are installed
echo "🔧 Checking for deployment CLI tools..."
echo ""

if command -v netlify &> /dev/null; then
    echo "✅ Netlify CLI is installed"
    read -p "   Deploy to Netlify now? (y/n): " deploy_netlify
    if [ "$deploy_netlify" = "y" ]; then
        echo "🚀 Deploying to Netlify..."
        netlify deploy --prod --dir=dist
        echo "✅ Netlify deployment complete!"
    fi
else
    echo "⚠️  Netlify CLI not installed"
    echo "   Install: npm install -g netlify-cli"
fi
echo ""

if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is installed"
    read -p "   Deploy to Vercel now? (y/n): " deploy_vercel
    if [ "$deploy_vercel" = "y" ]; then
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        echo "✅ Vercel deployment complete!"
    fi
else
    echo "⚠️  Vercel CLI not installed"
    echo "   Install: npm install -g vercel"
fi
echo ""

# Option to preview locally
read -p "🌐 Preview locally before deploying? (y/n): " preview_local
if [ "$preview_local" = "y" ]; then
    echo ""
    echo "🌐 Starting local preview..."
    echo "📍 Open http://localhost:4173 in your browser"
    echo "   Press Ctrl+C to stop"
    echo ""
    npm run preview
fi

echo ""
echo "🎉 All done!"
echo ""
echo "📚 For more deployment options, see:"
echo "   - DEPLOYMENT_GUIDE.md (comprehensive guide)"
echo "   - BACKUP_DEPLOYMENT_CHECKLIST.md (pre-demo checklist)"
echo "   - BUILD_SCRIPTS.md (more scripts)"
echo ""
echo "💡 Next steps:"
echo "   1. Test your deployed URL"
echo "   2. Update your Devpost submission"
echo "   3. Prepare your demo"
echo ""

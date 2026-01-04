#!/bin/bash

# 🆘 Emergency Demo Script
# Use this when you need a public URL immediately (interviews, live demos, etc.)

echo "🆘 EMERGENCY DEMO SETUP"
echo "======================="
echo ""
echo "This script will:"
echo "  1. Start your local dev server"
echo "  2. Create a public URL with ngrok"
echo "  3. Give you a shareable link for demos"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📥 ngrok not found. Installing..."
    
    # Try npm install
    npm install -g ngrok
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "⚠️  Could not install ngrok automatically."
        echo ""
        echo "Please install manually:"
        echo "  - Visit: https://ngrok.com/download"
        echo "  - Or run: npm install -g ngrok"
        echo ""
        exit 1
    fi
fi

echo "✅ ngrok is ready"
echo ""

# Start dev server in background
echo "🔨 Starting development server..."
npm run dev > /tmp/vite-dev.log 2>&1 &
DEV_PID=$!

echo "   Server PID: $DEV_PID"
echo "   Waiting for server to start..."
sleep 8

# Check if server started
if ! kill -0 $DEV_PID 2>/dev/null; then
    echo "❌ Failed to start dev server"
    cat /tmp/vite-dev.log
    exit 1
fi

echo "✅ Dev server is running"
echo ""

# Start ngrok
echo "🌐 Creating public URL with ngrok..."
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     YOUR PUBLIC URL                            ║"
echo "║                                                                ║"
echo "║  Your app will be accessible at the ngrok URL below           ║"
echo "║  Share this URL for interviews, demos, or testing             ║"
echo "║                                                                ║"
echo "║  Press Ctrl+C to stop the demo                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping demo..."
    kill $DEV_PID 2>/dev/null || true
    echo "✅ Cleanup complete"
    exit 0
}

# Set up cleanup on exit
trap cleanup EXIT INT TERM

# Start ngrok
ngrok http 5173

# If ngrok exits, cleanup will run automatically

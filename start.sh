#!/bin/bash

echo "🚀 Starting Video Downloader..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the development server
echo "✨ Starting Next.js development server..."
echo "🌐 Open http://localhost:3000 in your browser"
echo ""

npm run dev

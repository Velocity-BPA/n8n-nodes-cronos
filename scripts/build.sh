#!/bin/bash
# Build script for n8n-nodes-cronos
# Copyright (c) Velocity BPA, LLC - BSL 1.1

set -e

echo "🔨 Building n8n-nodes-cronos..."

# Clean previous build
rm -rf dist/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Run linting
echo "🔍 Running lint..."
pnpm lint

# Compile TypeScript
echo "📝 Compiling TypeScript..."
pnpm exec tsc

# Copy icons
echo "🎨 Copying icons..."
pnpm exec gulp build:icons

echo "✅ Build complete!"
echo ""
echo "Output directory: dist/"
ls -la dist/

#!/bin/bash
# Test script for n8n-nodes-cronos
# Copyright (c) Velocity BPA, LLC - BSL 1.1

set -e

echo "🧪 Running tests for n8n-nodes-cronos..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Run unit tests
echo "📋 Running unit tests..."
pnpm test

# Run integration tests (optional)
if [ "$1" == "--integration" ]; then
    echo "🌐 Running integration tests..."
    RUN_INTEGRATION_TESTS=true pnpm test
fi

# Run tests with coverage (optional)
if [ "$1" == "--coverage" ]; then
    echo "📊 Running tests with coverage..."
    pnpm test:coverage
fi

echo ""
echo "✅ All tests passed!"

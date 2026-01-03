#!/bin/bash
# Local installation script for n8n-nodes-cronos
# Copyright (c) Velocity BPA, LLC - BSL 1.1

set -e

echo "📦 Installing n8n-nodes-cronos locally..."

# Determine n8n custom directory
N8N_CUSTOM_DIR="${N8N_CUSTOM_EXTENSIONS_DIR:-$HOME/.n8n/custom}"

# Build the project
echo "🔨 Building project..."
./scripts/build.sh

# Create custom directory if it doesn't exist
mkdir -p "$N8N_CUSTOM_DIR"

# Link or copy to n8n
if [ "$1" == "--link" ]; then
    echo "🔗 Creating symlink..."
    ln -sf "$(pwd)" "$N8N_CUSTOM_DIR/n8n-nodes-cronos"
else
    echo "📂 Copying to n8n custom directory..."
    rm -rf "$N8N_CUSTOM_DIR/n8n-nodes-cronos"
    cp -r . "$N8N_CUSTOM_DIR/n8n-nodes-cronos"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "To use the node:"
echo "1. Restart n8n"
echo "2. The Cronos node should appear in your node list"
echo ""
echo "Installed to: $N8N_CUSTOM_DIR/n8n-nodes-cronos"

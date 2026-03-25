#!/bin/bash
# OpenVox VSCode Extension - Build Script
# Compiles and packages the extension for installation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🦊 OpenVox VSCode Extension Builder"
echo "===================================="
echo

# Step 1: Ensure syntax grammar exists
echo "📥 Checking syntax grammar..."
if [ ! -f "syntaxes/puppet.tmLanguage" ] || [ ! -s "syntaxes/puppet.tmLanguage" ]; then
    echo "   Downloading Puppet syntax grammar..."
    curl -sL "https://raw.githubusercontent.com/puppetlabs/puppet-editor-syntax/main/syntaxes/puppet.tmLanguage" > syntaxes/puppet.tmLanguage
    echo "   ✅ Downloaded $(wc -c < syntaxes/puppet.tmLanguage) bytes"
else
    echo "   ✅ Syntax grammar present ($(wc -c < syntaxes/puppet.tmLanguage) bytes)"
fi

# Step 2: Install npm dependencies
echo
echo "📦 Installing npm dependencies..."
npm install

# Step 3: Compile TypeScript
echo
echo "🔨 Compiling TypeScript..."
npm run compile

# Step 4: Package VSIX (if vsce is available)
echo
echo "📦 Packaging extension..."
if command -v npx &> /dev/null; then
    npx vsce package --out openvox-vscode.vsix 2>/dev/null || echo "   (vsce not configured, skipping VSIX packaging)"
else
    echo "   (npx not available, skipping VSIX packaging)"
fi

echo
echo "✅ Build complete!"
echo
echo "To install:"
echo "  ./install.sh              # Full install (includes gems)"
echo "  code --install-extension openvox-vscode.vsix   # VSIX only"
echo "  npm run watch             # Development mode"
echo

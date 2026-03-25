#!/bin/bash
# OpenVox VSCode Extension - Install Script
# One-command install for OpenVox IDE in VS Code

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🦊 OpenVox IDE for VS Code - Installer"
echo "======================================="
echo

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v code &> /dev/null; then
    echo "❌ VS Code 'code' command not found in PATH"
    echo "   Please install VS Code and add it to PATH"
    echo "   https://code.visualstudio.com/docs/setup/mac"
    exit 1
fi
echo "   ✅ VS Code found"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    echo "   Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
echo "   ✅ Node.js $(node --version)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "   ✅ npm $(npm --version)"

# Run build
echo
echo "🔨 Building extension..."
./build.sh

# Install VSIX
echo
VSIX_FILE=$(ls -t openvox-vscode-*.vsix 2>/dev/null | head -1 || echo "")
if [ -n "$VSIX_FILE" ] && [ -f "$VSIX_FILE" ]; then
    echo "📥 Installing VSCode extension: $VSIX_FILE"
    code --install-extension "$VSIX_FILE" --force
    echo "   ✅ Extension installed"
else
    echo "⚠️  No VSIX file found. Installing from source..."
    code --install-extension . --force 2>/dev/null || echo "   (install from source not supported, use build.sh)"
fi

# Install optional gem dependencies
echo
echo "💎 Installing optional gem dependencies..."
echo "   (These enable full linting/validation features)"

install_gem() {
    if gem list "$1" -i &> /dev/null; then
        echo "   ✅ $1 already installed"
    else
        echo "   Installing $1..."
        gem install "$1" --no-document 2>/dev/null && echo "   ✅ $1 installed" || echo "   ⚠️  $1 install failed (may need sudo)"
    fi
}

install_gem "openvox-lint"
install_gem "metadata-json-lint"

# Optional: yamllint via pip
if command -v pip3 &> /dev/null || command -v pip &> /dev/null; then
    if python3 -c "import yamllint" 2>/dev/null || python -c "import yamllint" 2>/dev/null; then
        echo "   ✅ yamllint already installed"
    else
        echo "   Installing yamllint (Python)..."
        pip3 install yamllint --quiet 2>/dev/null || pip install yamllint --quiet 2>/dev/null || echo "   ⚠️  yamllint install failed (optional)"
    fi
fi

echo
echo "🎉 Installation complete!"
echo
echo "Next steps:"
echo "  1. Restart VS Code"
echo "  2. Open a .pp file to activate OpenVox features"
echo "  3. Use Ctrl+Alt+L to lint, Ctrl+Alt+V to validate"
echo
echo "Optional: Install OpenVox Server for full validation:"
echo "  gem install openvox"
echo

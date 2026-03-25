# OpenVox VSCode Extension

OpenVox IDE support for VS Code — syntax highlighting, linting, validation, and PDK-like tasks for OpenVox modules.

## Features

| Feature | Description |
|---------|-------------|
| **Syntax Highlighting** | Puppet/OpenVox DSL (via TextMate grammar) |
| **Linting** | openvox-lint integration with diagnostics |
| **Validation** | `openvox parser validate` on save |
| **Auto-Fix** | Auto-fix lint issues |
| **Unit Tests** | Run `openvox test unit` from command palette |
| **Snippets** | Class, define, resource, and control flow snippets |
| **Tasks** | VS Code tasks for validate, lint, test |
| **Keybindings** | Ctrl+Alt+L (lint), Ctrl+Alt+V (validate) |
| **Configuration** | Customizable linter, line length, and more |

## Requirements

- **VS Code** 1.75+
- **OpenVox or Puppet** 8.x (for validation)
- **openvox-lint** (`gem install openvox-lint`)
- **metadata-json-lint** (`gem install metadata-json-lint`) — optional
- **yamllint** (`pip install yamllint`) — optional

## Installation

### One-Command Install (Recommended)

```bash
git clone https://github.com/cvquesty/openvox-vscode.git
cd openvox-vscode
./install.sh
```

This automatically:
- ✅ Downloads the Puppet syntax grammar
- ✅ Installs npm dependencies
- ✅ Compiles the extension
- ✅ Packages and installs to VS Code
- ✅ Installs `openvox-lint` and `metadata-json-lint` gems (optional)

### Quick Build

```bash
./build.sh     # Build extension
./install.sh   # Full install with gems
```

### Manual Build

```bash
npm install
npm run compile
npm run package
code --install-extension openvox-vscode.vsix
```

## Configuration

Settings (`settings.json`):

```json
{
  "openvox.editorService.enable": true,
  "openvox.editorService.puppet.command": "openvox",
  "openvox.lint.command": "openvox-lint",
  "openvox.lint.autoFixOnSave": false,
  "openvox.lint.maxLineLength": 140,
  "openvox.validate.onSave": true
}
```

## Commands

| Command | Description |
|---------|-------------|
| `OpenVox: Validate Manifest` | Run `openvox parser validate` |
| `OpenVox: Lint Manifest` | Run `openvox-lint` |
| `OpenVox: Auto-Fix Lint Issues` | Run `openvox-lint --fix` |
| `OpenVox: Run Unit Tests` | Run `openvox test unit` |
| `OpenVox: Validate metadata.json` | Run `metadata-json-lint` |
| `OpenVox: Lint Hiera YAML` | Run `yamllint` |

## Tasks

Access via Terminal → Run Task → OpenVox: ...

- OpenVox: Validate
- OpenVox: Lint
- OpenVox: Lint Fix
- OpenVox: Run Unit Tests
- OpenVox: Validate metadata.json
- OpenVox: Validate All

## Syntax Highlighting

This extension includes the Puppet TextMate grammar (auto-downloaded during build). Syntax highlighting works out of the box for `.pp` and `.epp` files.

The grammar is sourced from [puppet-editor-syntax](https://github.com/puppetlabs/puppet-editor-syntax) and bundled automatically via `build.sh` or `install.sh`.

## Development

```bash
npm install
npm run compile
npm run watch  # for development
```

## Testing

Run the test suite:

```bash
npm test
```

Tests include:
- Extension activation verification
- Command registration checks (validate, lint, lintFix, test, validateMetadata, lintYaml)
- Language configuration validation

**Note:** Integration tests require VS Code to be available. The test runner downloads VS Code Electron automatically.

## License

Apache-2.0 — see [LICENSE](LICENSE)

## Related Projects

- [openvox-lint](https://github.com/cvquesty/openvox-lint) — Style linter for OpenVox/Puppet
- [vim-openvox](https://github.com/cvquesty/vim-openvox) — Vim IDE plugin
- [openvox-gui](https://github.com/cvquesty/openvox-gui) — Web-based OpenVox management
- [puppet-vscode](https://github.com/puppetlabs/puppet-vscode) — Official Puppet extension (compatible)
- [puppet-editor-services](https://github.com/puppetlabs/puppet-editor-services) — LSP/DAP server

## Contributing

Contributions welcome! Open an issue or PR on the [GitHub repository](https://github.com/cvquesty/openvox-vscode).

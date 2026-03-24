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

### From Source

```bash
git clone https://github.com/cvquesty/openvox-vscode.git
cd openvox-vscode
npm install
npm run compile
```

Then open in VS Code and press F5 to run the extension in development mode.

### From VSIX

```bash
npm run compile
npx vsce package
code --install-extension openvox-vscode-*.vsix
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

This extension uses the Puppet TextMate grammar. For full syntax support, ensure the grammar file is present at `syntaxes/puppet.tmLanguage.json`.

You can copy it from the [puppet-editor-syntax](https://github.com/puppetlabs/puppet-editor-syntax) repository:

```bash
curl -o syntaxes/puppet.tmLanguage.json https://raw.githubusercontent.com/puppetlabs/puppet-editor-syntax/main/syntaxes/puppet.tmLanguage.json
```

## Development

```bash
npm install
npm run compile
npm run watch  # for development
```

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

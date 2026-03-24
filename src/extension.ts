/**
 * OpenVox VSCode Extension
 * 
 * Provides IDE support for OpenVox (community fork of Puppet):
 * - Syntax highlighting (via TextMate grammar)
 * - Linting with openvox-lint
 * - Validation with openvox/puppet parser
 * - PDK-like tasks (validate, test, lint)
 * - Optional LSP integration via puppet-editor-services
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';

let diagnosticCollection: vscode.DiagnosticCollection;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    console.log('OpenVox extension activated');

    // Create output channel
    outputChannel = vscode.window.createOutputChannel('OpenVox');
    context.subscriptions.push(outputChannel);

    // Create diagnostic collection for linting
    diagnosticCollection = vscode.languages.createDiagnosticCollection('openvox');
    context.subscriptions.push(diagnosticCollection);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('openvox.validate', validateManifest),
        vscode.commands.registerCommand('openvox.lint', lintManifest),
        vscode.commands.registerCommand('openvox.lintFix', lintFixManifest),
        vscode.commands.registerCommand('openvox.test', runUnitTests),
        vscode.commands.registerCommand('openvox.validateMetadata', validateMetadata),
        vscode.commands.registerCommand('openvox.lintYaml', lintYaml)
    );

    // Auto-lint on save if enabled
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
            if (document.languageId === 'puppet') {
                const config = vscode.workspace.getConfiguration('openvox');
                if (config.get<boolean>('validate.onSave')) {
                    validateManifest(document);
                }
                if (config.get<boolean>('lint.autoFixOnSave')) {
                    lintManifest(document);
                }
            }
        })
    );

    // Auto-lint on open
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((document) => {
            if (document.languageId === 'puppet') {
                lintManifest(document);
            }
        })
    );

    outputChannel.appendLine('OpenVox extension ready');
}

export function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
    if (outputChannel) {
        outputChannel.dispose();
    }
}

/**
 * Run openvox/puppet parser validate on the current manifest
 */
async function validateManifest(document?: vscode.TextDocument) {
    const doc = document || vscode.window.activeTextEditor?.document;
    if (!doc || doc.languageId !== 'puppet') {
        vscode.window.showWarningMessage('OpenVox: Open a .pp or .epp file to validate');
        return;
    }

    const config = vscode.workspace.getConfiguration('openvox');
    const puppetCmd = config.get<string>('editorService.puppet.command', 'openvox');
    
    outputChannel.appendLine(`Validating ${doc.fileName}...`);
    outputChannel.show(true);

    const child = cp.spawn(puppetCmd, ['parser', 'validate', doc.fileName], {
        cwd: path.dirname(doc.fileName)
    });

    let stderr = '';
    let stdout = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
        if (code === 0) {
            outputChannel.appendLine('✓ Validation passed');
            vscode.window.showInformationMessage('OpenVox: Validation passed');
        } else {
            outputChannel.appendLine(`✗ Validation failed:\n${stderr || stdout}`);
            vscode.window.showErrorMessage('OpenVox: Validation failed (see output)');
        }
    });

    child.on('error', (err) => {
        outputChannel.appendLine(`Error running ${puppetCmd}: ${err.message}`);
        vscode.window.showErrorMessage(`OpenVox: Could not run ${puppetCmd}. Is it installed?`);
    });
}

/**
 * Run openvox-lint on the current manifest
 */
async function lintManifest(document?: vscode.TextDocument) {
    const doc = document || vscode.window.activeTextEditor?.document;
    if (!doc || doc.languageId !== 'puppet') {
        vscode.window.showWarningMessage('OpenVox: Open a .pp or .epp file to lint');
        return;
    }

    const config = vscode.workspace.getConfiguration('openvox');
    const lintCmd = config.get<string>('lint.command', 'openvox-lint');
    const maxLineLength = config.get<number>('lint.maxLineLength', 140);

    outputChannel.appendLine(`Linting ${doc.fileName}...`);
    outputChannel.show(true);

    const args = ['--with-filename', `--max-line-length=${maxLineLength}`, doc.fileName];
    const child = cp.spawn(lintCmd, args, {
        cwd: path.dirname(doc.fileName)
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
        // Parse lint output and create diagnostics
        const diagnostics: vscode.Diagnostic[] = [];
        
        const lines = (stdout + stderr).split('\n');
        for (const line of lines) {
            // Parse openvox-lint/puppet-lint output format
            // Example: file.pp - WARNING: line 10, column 5: description is missing
            const match = line.match(/(.+?)\s*-\s*(WARNING|ERROR):\s*line\s+(\d+),\s*column\s+(\d+):\s*(.+)/i);
            if (match) {
                const [, , severity, lineNum, colNum, message] = match;
                const range = new vscode.Range(
                    parseInt(lineNum) - 1,
                    parseInt(colNum) - 1,
                    parseInt(lineNum) - 1,
                    parseInt(colNum) + 10
                );
                const diagnostic = new vscode.Diagnostic(
                    range,
                    message,
                    severity.toUpperCase() === 'ERROR' 
                        ? vscode.DiagnosticSeverity.Error 
                        : vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }
        }

        diagnosticCollection.set(doc.uri, diagnostics);

        if (diagnostics.length === 0 && code === 0) {
            outputChannel.appendLine('✓ No lint issues found');
            vscode.window.showInformationMessage('OpenVox: No lint issues');
        } else {
            outputChannel.appendLine(`Found ${diagnostics.length} lint issue(s)`);
        }
    });

    child.on('error', (err) => {
        outputChannel.appendLine(`Error running ${lintCmd}: ${err.message}`);
        vscode.window.showErrorMessage(`OpenVox: Could not run ${lintCmd}. Is it installed?`);
    });
}

/**
 * Run openvox-lint with auto-fix
 */
async function lintFixManifest() {
    const doc = vscode.window.activeTextEditor?.document;
    if (!doc || doc.languageId !== 'puppet') {
        vscode.window.showWarningMessage('OpenVox: Open a .pp or .epp file to auto-fix');
        return;
    }

    const config = vscode.workspace.getConfiguration('openvox');
    const lintCmd = config.get<string>('lint.command', 'openvox-lint');

    outputChannel.appendLine(`Auto-fixing ${doc.fileName}...`);
    outputChannel.show(true);

    const child = cp.spawn(lintCmd, ['--fix', doc.fileName], {
        cwd: path.dirname(doc.fileName)
    });

    child.on('close', (code) => {
        if (code === 0) {
            outputChannel.appendLine('✓ Auto-fix completed');
            vscode.window.showInformationMessage('OpenVox: Auto-fix completed');
            // Reload the document
            vscode.commands.executeCommand('workbench.action.files.revert');
        } else {
            outputChannel.appendLine('Auto-fix completed with some issues');
        }
    });

    child.on('error', (err) => {
        vscode.window.showErrorMessage(`OpenVox: Could not run ${lintCmd}: ${err.message}`);
    });
}

/**
 * Run unit tests for the module
 */
async function runUnitTests() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showWarningMessage('OpenVox: Open a module folder to run tests');
        return;
    }

    const moduleRoot = workspaceFolder.uri.fsPath;
    outputChannel.appendLine(`Running unit tests in ${moduleRoot}...`);
    outputChannel.show(true);

    // Try openvox test unit first, then fall back to pdk or rake
    const commands = [
        ['openvox', 'test', 'unit'],
        ['pdk', 'test', 'unit'],
        ['rake', 'spec']
    ];

    let executed = false;
    for (const cmd of commands) {
        try {
            const child = cp.spawn(cmd[0], cmd.slice(1), {
                cwd: moduleRoot,
                shell: true
            });

            child.stdout.on('data', (data) => outputChannel.append(data.toString()));
            child.stderr.on('data', (data) => outputChannel.append(data.toString()));

            child.on('close', (code) => {
                if (code === 0) {
                    outputChannel.appendLine('✓ Tests passed');
                    vscode.window.showInformationMessage('OpenVox: Tests passed');
                } else {
                    outputChannel.appendLine(`✗ Tests failed (exit code ${code})`);
                }
            });

            executed = true;
            break;
        } catch {
            continue;
        }
    }

    if (!executed) {
        vscode.window.showWarningMessage('OpenVox: Could not find test runner (openvox, pdk, or rake)');
    }
}

/**
 * Validate metadata.json
 */
async function validateMetadata() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showWarningMessage('OpenVox: Open a module folder');
        return;
    }

    const metadataPath = path.join(workspaceFolder.uri.fsPath, 'metadata.json');
    outputChannel.appendLine(`Validating ${metadataPath}...`);
    outputChannel.show(true);

    const child = cp.spawn('metadata-json-lint', [metadataPath], {
        cwd: workspaceFolder.uri.fsPath
    });

    child.stdout.on('data', (data) => outputChannel.append(data.toString()));
    child.stderr.on('data', (data) => outputChannel.append(data.toString()));

    child.on('close', (code) => {
        if (code === 0) {
            outputChannel.appendLine('✓ metadata.json is valid');
            vscode.window.showInformationMessage('OpenVox: metadata.json is valid');
        } else {
            outputChannel.appendLine('✗ metadata.json has issues');
            vscode.window.showErrorMessage('OpenVox: metadata.json validation failed');
        }
    });

    child.on('error', () => {
        vscode.window.showErrorMessage('OpenVox: metadata-json-lint not found. Install with: gem install metadata-json-lint');
    });
}

/**
 * Lint YAML file (Hiera)
 */
async function lintYaml() {
    const doc = vscode.window.activeTextEditor?.document;
    if (!doc || !doc.fileName.endsWith('.yaml') && !doc.fileName.endsWith('.yml')) {
        vscode.window.showWarningMessage('OpenVox: Open a YAML file to lint');
        return;
    }

    outputChannel.appendLine(`Linting YAML: ${doc.fileName}...`);
    outputChannel.show(true);

    const child = cp.spawn('yamllint', [doc.fileName]);

    child.stdout.on('data', (data) => outputChannel.append(data.toString()));
    child.stderr.on('data', (data) => outputChannel.append(data.toString()));

    child.on('close', (code) => {
        if (code === 0) {
            outputChannel.appendLine('✓ YAML is valid');
            vscode.window.showInformationMessage('OpenVox: YAML is valid');
        } else {
            outputChannel.appendLine('✗ YAML has issues');
        }
    });

    child.on('error', () => {
        vscode.window.showErrorMessage('OpenVox: yamllint not found. Install with: pip install yamllint');
    });
}

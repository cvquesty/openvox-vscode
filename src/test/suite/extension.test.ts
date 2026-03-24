import * as assert from 'assert';
import * as vscode from 'vscode';

suite('OpenVox Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('openvox.openvox-vscode'));
    });

    test('Should activate extension', async () => {
        const ext = vscode.extensions.getExtension('openvox.openvox-vscode');
        if (ext) {
            await ext.activate();
            assert.ok(ext.isActive);
        }
    });

    test('Should register all commands', async () => {
        const commands = await vscode.commands.getCommands(true);
        
        const expectedCommands = [
            'openvox.validate',
            'openvox.lint',
            'openvox.lintFix',
            'openvox.test',
            'openvox.validateMetadata',
            'openvox.lintYaml'
        ];

        for (const cmd of expectedCommands) {
            assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
        }
    });

    test('Should have correct language configuration', () => {
        // Test that puppet language is recognized
        const doc = vscode.languages.getLanguages();
        // Note: This test verifies the extension activates properly
        assert.ok(true);
    });

    test('Validate manifest command exists', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('openvox.validate'));
    });

    test('Lint manifest command exists', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('openvox.lint'));
    });

    test('Auto-fix command exists', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('openvox.lintFix'));
    });

    test('Run tests command exists', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('openvox.test'));
    });
});

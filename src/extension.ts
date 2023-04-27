import path from 'node:path';

import type { Uri } from 'vscode';
import vscode from 'vscode';

import { logger } from './logger';

async function handleCompress(uri: Uri, format: string) {
    const { compress } = await import('./compress');
    const sourcePath = uri.fsPath;
    const archivePath = `${sourcePath}.${format}`;
    try {
        await compress(sourcePath, archivePath);
    } catch (error: any) {
        vscode.window.showErrorMessage(error);
    }
}

export function activate(context: vscode.ExtensionContext) {
    const decompressCmd = vscode.commands.registerCommand(
        'vscode-archive.decompress',
        async (archiveUri: Uri) => {
            const { decompress } = await import('./decompress');
            const archivePath = archiveUri.fsPath;
            const dest = path.resolve(
                archivePath,
                `../${path.basename(archivePath, path.extname(archivePath))}`,
            );
            try {
                await decompress(archivePath, dest);
            } catch (error: any) {
                vscode.window.showErrorMessage(error);
            }
        },
    );

    context.subscriptions.push(
        decompressCmd,
        vscode.commands.registerCommand('vscode-archive.compressToZip', (uri) =>
            handleCompress(uri, 'zip'),
        ),
        vscode.commands.registerCommand('vscode-archive.compressToAsar', (uri) =>
            handleCompress(uri, 'asar'),
        ),
        vscode.commands.registerCommand('vscode-archive.compressToGzip', (uri) =>
            handleCompress(uri, 'gzip'),
        ),
        vscode.commands.registerCommand('vscode-archive.compressToBr', (uri) =>
            handleCompress(uri, 'br'),
        ),
        vscode.commands.registerCommand('vscode-archive.compressToTar', (uri) =>
            handleCompress(uri, 'tar'),
        ),
        vscode.commands.registerCommand('vscode-archive.compressToTgz', (uri) =>
            handleCompress(uri, 'tgz'),
        ),
        vscode.commands.registerCommand('vscode-archive.compressToVsix', (uri) =>
            handleCompress(uri, 'vsix'),
        ),
    );
}

export function deactivate() {
    logger.dispose();
}

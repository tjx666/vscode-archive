import path from 'node:path';

import type { Uri } from 'vscode';
import vscode from 'vscode';

import { decompress } from './decompress';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'vscode-archive.decompress',
        (archiveUri: Uri) => {
            const archivePath = archiveUri.fsPath;
            const dest = path.resolve(
                archivePath,
                `../${path.basename(archivePath, path.extname(archivePath))}`,
            );
            try {
                decompress(archivePath, dest);
            } catch (error: any) {
                vscode.window.showErrorMessage(error);
            }
        },
    );

    context.subscriptions.push(disposable);
}

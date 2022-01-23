import vscode, { Uri } from 'vscode';
import path from 'path';
import { decompress } from './decompress';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vscode-archive" is now active!');

    const disposable = vscode.commands.registerCommand(
        'vscode-archive.decompress',
        (archiveUri: Uri) => {
            const archivePath = archiveUri.fsPath;
            const dest = path.resolve(
                archivePath,
                `../${path.basename(archivePath, path.extname(archivePath))}`,
            );
            decompress(archivePath, dest);
        },
    );

    context.subscriptions.push(disposable);
}

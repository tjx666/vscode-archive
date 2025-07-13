import fs from 'node:fs/promises';
import path from 'node:path';

import type { Uri } from 'vscode';
import vscode from 'vscode';

import {
    ensureExtension,
    fileExists,
    generateDefaultName,
    getUniqueFileNameSync,
    validateFileName,
} from './fileUtils';

/**
 * Handle compression of multiple files/folders
 */
export async function handleCompressMultiple(uris: Uri[], format: string) {
    try {
        // 1. 生成默认文件名（已经处理重名）
        const defaultName = await generateDefaultName(uris, format);

        // 2. 让用户输入文件名
        const fileName = await vscode.window.showInputBox({
            prompt: `Enter name for ${format.toUpperCase()} archive`,
            value: defaultName,
            validateInput: (value) => validateFileName(value, format),
        });

        if (!fileName) {
            return;
        }

        // 3. 确保文件名有正确的扩展名
        const finalFileName = ensureExtension(fileName, format);

        // 4. 确定保存路径
        const saveDir = path.dirname(uris[0].fsPath);
        const archivePath = path.join(saveDir, finalFileName);

        // 5. 如果用户修改了文件名，检查是否会覆盖现有文件
        if (finalFileName !== defaultName && (await fileExists(archivePath))) {
            const overwrite = await vscode.window.showWarningMessage(
                `File "${finalFileName}" already exists. Overwrite?`,
                'Yes',
                'No',
            );
            if (overwrite !== 'Yes') {
                return;
            }
        }

        // 6. 如果只有一个文件/文件夹，直接使用原有逻辑
        if (uris.length === 1) {
            const { compress } = await import('../compress');
            await compress(uris[0].fsPath, archivePath);
            vscode.window.showInformationMessage(`Archive created: ${finalFileName}`);
            return;
        }

        // 7. 多个文件时，创建临时文件夹
        const tempFolderName = `temp-archive-${Date.now()}`;
        const tempDir = path.join(saveDir, tempFolderName);

        try {
            await fs.mkdir(tempDir, { recursive: true });

            // 8. 复制文件到临时文件夹
            const copyPromises = uris.map(async (uri) => {
                const sourcePath = uri.fsPath;
                const fileName = getUniqueFileNameSync(tempDir, path.basename(sourcePath));
                const destPath = path.join(tempDir, fileName);

                const stats = await fs.stat(sourcePath);
                if (stats.isDirectory()) {
                    await fs.cp(sourcePath, destPath, { recursive: true });
                } else {
                    await fs.copyFile(sourcePath, destPath);
                }
            });

            await Promise.all(copyPromises);

            // 9. 压缩临时文件夹
            const { compress } = await import('../compress');
            await compress(tempDir, archivePath);

            // 10. 显示成功消息
            vscode.window.showInformationMessage(`Archive created: ${finalFileName}`);
        } finally {
            // 11. 清理临时文件夹
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Compression failed: ${error.message}`);
    }
}

/**
 * Register a compression command with unified parameter handling
 */
export function registerCompressCommand(
    context: vscode.ExtensionContext,
    commandId: string,
    format: string,
) {
    const cmd = vscode.commands.registerCommand(commandId, async (...args) => {
        try {
            console.log('received args', args);

            if (args.length > 1 && Array.isArray(args[1])) {
                // 多选情况：需要用户选择文件名
                const selectedUris: Uri[] = args[1];
                await handleCompressMultiple(selectedUris, format);
            } else {
                // 单选情况：使用原有逻辑
                const uri: Uri = args[0];
                const { handleCompress } = await import('../extension');
                await handleCompress(uri, format);
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Compression failed: ${error.message}`);
        }
    });

    context.subscriptions.push(cmd);
}

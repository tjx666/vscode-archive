import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { Uri } from 'vscode';

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get a unique filename by appending numbers if needed (async version)
 */
export async function getUniqueFileName(
    baseDir: string,
    baseName: string,
    format: string,
): Promise<string> {
    let fileName = `${baseName}.${format}`;
    let counter = 1;

    // eslint-disable-next-line no-await-in-loop
    while (await fileExists(path.join(baseDir, fileName))) {
        fileName = `${baseName}-${counter}.${format}`;
        counter++;
    }

    return fileName;
}

/**
 * Get a unique filename by appending numbers if needed (sync version)
 */
export function getUniqueFileNameSync(baseDir: string, baseName: string): string {
    let fileName = baseName;
    let counter = 1;

    while (existsSync(path.join(baseDir, fileName))) {
        const ext = path.extname(baseName);
        const name = path.basename(baseName, ext);
        fileName = `${name}-${counter}${ext}`;
        counter++;
    }

    return fileName;
}

/**
 * Validate filename input
 */
export function validateFileName(fileName: string, _format: string): string | undefined {
    if (!fileName || fileName.trim() === '') {
        return 'File name cannot be empty';
    }

    // 检查非法字符
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(fileName)) {
        return 'File name contains invalid characters';
    }

    // 检查长度
    if (fileName.length > 255) {
        return 'File name is too long';
    }

    return undefined;
}

/**
 * Ensure filename has the correct extension
 */
export function ensureExtension(fileName: string, format: string): string {
    const expectedExt = `.${format}`;
    if (fileName.endsWith(expectedExt)) {
        return fileName;
    }

    // 移除其他扩展名再加上正确的扩展名
    const nameWithoutExt = fileName.replace(/\.[^.]*$/, '');
    return `${nameWithoutExt}${expectedExt}`;
}

/**
 * Generate default filename for compression
 */
export async function generateDefaultName(uris: Uri[], format: string): Promise<string> {
    const baseDir = path.dirname(uris[0].fsPath);

    if (uris.length === 1) {
        // 单文件：使用原文件名
        const fileName = path.basename(uris[0].fsPath);
        const nameWithoutExt = fileName.replace(/\.[^.]*$/, '');
        return await getUniqueFileName(baseDir, nameWithoutExt, format);
    }

    // 多文件：生成基础名称
    const baseName = generateBaseName(uris);
    return await getUniqueFileName(baseDir, baseName, format);
}

/**
 * Generate base name for multiple files
 */
export function generateBaseName(uris: Uri[]): string {
    // 策略 1：检查是否都在同一个目录
    const dirs = uris.map((uri) => path.dirname(uri.fsPath));
    const uniqueDirs = [...new Set(dirs)];

    if (uniqueDirs.length === 1) {
        const dirName = path.basename(uniqueDirs[0]);
        if (dirName && dirName !== '.' && dirName !== '') {
            return dirName;
        }
    }

    // 策略 2：寻找共同的父目录
    const commonDir = getCommonDirectory(uris);
    if (commonDir) {
        const parentDirName = path.basename(commonDir);
        if (parentDirName && parentDirName !== '.' && parentDirName !== '') {
            return parentDirName;
        }
    }

    // 策略 3：基于文件名的模式匹配
    const fileNames = uris.map((uri) => path.basename(uri.fsPath));
    const commonPrefix = getCommonPrefix(fileNames);
    if (commonPrefix && commonPrefix.length > 2) {
        const cleanPrefix = commonPrefix.replace(/[-_.]+$/, '');
        if (cleanPrefix.length > 1) {
            return cleanPrefix;
        }
    }

    // 策略 4：使用通用名称
    return 'archive';
}

/**
 * Get common directory path from multiple URIs
 */
export function getCommonDirectory(uris: Uri[]): string | null {
    if (uris.length === 0) return null;

    const paths = uris.map((uri) => uri.fsPath);
    let commonPath = paths[0];

    for (let i = 1; i < paths.length; i++) {
        commonPath = getCommonPath(commonPath, paths[i]);
        if (!commonPath) break;
    }

    return commonPath;
}

/**
 * Get common path between two paths
 */
export function getCommonPath(path1: string, path2: string): string {
    const parts1 = path1.split(path.sep);
    const parts2 = path2.split(path.sep);

    const commonParts: string[] = [];
    for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
        if (parts1[i] === parts2[i]) {
            commonParts.push(parts1[i]);
        } else {
            break;
        }
    }

    return commonParts.join(path.sep);
}

/**
 * Get common prefix from multiple strings
 */
export function getCommonPrefix(strings: string[]): string {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];

    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
        while (strings[i].indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, Math.max(0, prefix.length - 1));
            if (prefix === '') return '';
        }
    }
    return prefix;
}

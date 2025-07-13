import type FS from 'node:fs';
import { constants as FS_CONSTANTS } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import prettyBytes from 'pretty-bytes';

export async function pathExists(path: string) {
    return fs
        .access(path, FS_CONSTANTS.F_OK)
        .then(() => true)
        .catch(() => false);
}

/**
 * https://github.com/microsoft/vscode/issues/143393#issuecomment-1047518447
 */
export async function getFileStats(filePath: string) {
    let originalFs: typeof FS;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        originalFs = require('node:original-fs') as typeof FS;
    } catch (error) {
        // FIXME: https://github.com/microsoft/vscode/issues/207221
        console.error(error);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        originalFs = require('node:fs');
    }
    return new Promise<FS.Stats>((resolve, reject) => {
        originalFs.lstat(filePath, (err, stats) => {
            if (err) reject(err);
            resolve(stats);
        });
    });
}

interface FileInfo {
    count: number;
    size: number;
}

export async function getFileInfo(filePath: string): Promise<FileInfo> {
    const stats = await getFileStats(filePath);
    const fileInfo: FileInfo = {
        count: 1,
        size: stats.size,
    };

    if (!stats.isDirectory()) {
        return fileInfo;
    }

    const childFiles = await fs.readdir(filePath);
    const childFileInfoList = await Promise.all(
        childFiles.map(async (childFileName) => {
            return getFileInfo(path.resolve(filePath, childFileName));
        }),
    );
    for (const childFileInfo of childFileInfoList) {
        fileInfo.count += childFileInfo.count;
        fileInfo.size += childFileInfo.size;
    }

    return fileInfo;
}

export async function analyzeCompress(originalPath: string, archivePath: string) {
    const [originalFileInfo, archiveFileInfo] = await Promise.all([
        getFileInfo(originalPath),
        getFileInfo(archivePath),
    ]);

    const compressRate = (originalFileInfo.size - archiveFileInfo.size) / originalFileInfo.size;
    return [
        `compress contains ${originalFileInfo.count} files`,
        `${prettyBytes(originalFileInfo.size)} -> ${prettyBytes(archiveFileInfo.size)}`,
        `compress rate: ${Math.round(compressRate * 1000) / 10}%`,
    ].join(', ');
}

export async function analyzeDecompress(archivePath: string, originalPath: string) {
    const [originalFileInfo, archiveFileInfo] = await Promise.all([
        getFileInfo(originalPath),
        getFileInfo(archivePath),
    ]);

    const changeSize = originalFileInfo.size - archiveFileInfo.size;
    const compressRate = changeSize / originalFileInfo.size;
    const increaseRate = changeSize / archiveFileInfo.size;
    return [
        `decompress extract out ${originalFileInfo.count} files`,
        `${prettyBytes(archiveFileInfo.size)} -> ${prettyBytes(originalFileInfo.size)}`,
        `increase rate: ${Math.round(increaseRate * 1000) / 10}%`,
        `compress rate: ${Math.round(compressRate * 1000) / 10}%`,
    ].join(', ');
}

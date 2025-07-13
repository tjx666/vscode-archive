import path from 'node:path';

import asar from 'asar';
import compressing from 'compressing';
import vscode from 'vscode';

import { analyzeDecompress } from '../fsUtils';
import { logger } from '../logger';
import { checkAndFlatten } from '../utils/smartFlatten';
import { decompress7z } from './decompress7z';
import { decompressBr } from './decompressBr';
import { decompressBz2 } from './decompressBz2';
import { decompressCrx } from './decompressCrx';

export async function decompress(archivePath: string, dest: string) {
    logger.info(`decompress from ${archivePath} to ${dest}`);

    // .zip -> zip
    const archiveExt = path.extname(archivePath).toLowerCase().slice(1);
    switch (archiveExt) {
        case 'zip':
        case 'vsix':
            await compressing.zip.decompress(archivePath, dest);
            break;
        case 'tgz':
            await compressing.tgz.decompress(archivePath, dest);
            break;
        case 'gzip':
        case 'gz':
            await compressing.gzip.decompress(archivePath, dest);
            break;
        case 'br':
            await decompressBr(archivePath, dest);
            break;
        case 'tar':
            await compressing.tar.decompress(archivePath, dest);
            break;
        case 'asar':
            asar.extractAll(archivePath, dest);
            break;
        case 'crx':
            await decompressCrx(archivePath, dest);
            break;
        case 'bz2':
            await decompressBz2(archivePath);
            break;
        case '7z':
            await decompress7z(archivePath);
            break;
    }

    // Check if smart flatten feature is enabled
    const config = vscode.workspace.getConfiguration('vscode-archive');
    const smartFlattenEnabled = config.get<boolean>('smartFlatten', true);

    if (smartFlattenEnabled) {
        // Try to apply smart flatten for redundant top-level folder
        const archiveName = path.basename(archivePath, path.extname(archivePath));
        const flattened = await checkAndFlatten(dest, archiveName);

        if (flattened) {
            logger.info(`Smart flatten applied: removed redundant folder '${archiveName}'`);
        }
    }

    logger.info(await analyzeDecompress(archivePath, dest));
}

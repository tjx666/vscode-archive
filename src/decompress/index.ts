import path from 'node:path';

import asar from 'asar';
import compressing from 'compressing';

import { decompress7z } from './decompress7z';
import { decompressBr } from './decompressBr';
import { decompressBz2 } from './decompressBz2';
import { decompressCrx } from './decompressCrx';
import { analyzeDecompress } from '../fsUtils';
import { logger } from '../logger';

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

    logger.info(await analyzeDecompress(archivePath, dest));
}

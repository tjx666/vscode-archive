import path from 'node:path';

import asar from 'asar';
import compressing from 'compressing';

import { decompressBr } from './decompressBr';
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
    }

    logger.info(await analyzeDecompress(archivePath, dest));
}

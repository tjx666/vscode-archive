import { extname } from 'node:path';

import asar from 'asar';
import compressing from 'compressing';

import { analyzeArchive, getFileStats } from './fsUtils';
import { logger } from './logger';

export async function compress(sourcePath: string, archivePath: string) {
    logger.info(`compress from ${sourcePath} to ${archivePath}`);

    // .zip => zip
    const ext = extname(archivePath).slice(1);
    const stats = await getFileStats(sourcePath);
    const isDir = stats.isDirectory();

    switch (ext) {
        case 'zip':
        case 'vsix':
            if (isDir) {
                await compressing.zip.compressDir(sourcePath, archivePath, { ignoreBase: true });
            } else {
                await compressing.zip.compressFile(sourcePath, archivePath, { ignoreBase: true });
            }
            break;
        case 'gzip':
            await compressing.gzip.compressFile(sourcePath, archivePath, { ignoreBase: true });
            break;
        case 'tar':
            if (isDir) {
                await compressing.tar.compressDir(sourcePath, archivePath, { ignoreBase: true });
            } else {
                await compressing.tar.compressFile(sourcePath, archivePath, { ignoreBase: true });
            }
            break;
        case 'tgz':
            if (isDir) {
                await compressing.tgz.compressDir(sourcePath, archivePath, { ignoreBase: true });
            } else {
                await compressing.tgz.compressFile(sourcePath, archivePath, { ignoreBase: true });
            }
            break;
        case 'asar':
            await asar.createPackage(sourcePath, archivePath);
            break;
    }

    logger.info(`compress ${await analyzeArchive(archivePath, sourcePath)}`);
}

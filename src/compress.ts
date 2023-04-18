import fs from 'node:fs/promises';
import { extname } from 'node:path';

import asar from 'asar';
import compressing from 'compressing';

export async function compress(sourcePath: string, archivePath: string) {
    // .zip => zip
    const ext = extname(archivePath).slice(1);
    const stats = await fs.stat(sourcePath);
    const isDirectory = stats.isDirectory();

    switch (ext) {
        case 'zip':
        case 'vsix':
            if (isDirectory) {
                await compressing.zip.compressDir(sourcePath, archivePath, { ignoreBase: true });
            } else {
                await compressing.zip.compressFile(sourcePath, archivePath, { ignoreBase: true });
            }
            break;
        case 'gzip':
            await compressing.gzip.compressFile(sourcePath, archivePath, { ignoreBase: true });
            break;
        case 'tar':
            if (isDirectory) {
                await compressing.tar.compressDir(sourcePath, archivePath, { ignoreBase: true });
            } else {
                await compressing.tar.compressFile(sourcePath, archivePath, { ignoreBase: true });
            }
            break;
        case 'tgz':
            if (isDirectory) {
                await compressing.tgz.compressDir(sourcePath, archivePath, { ignoreBase: true });
            } else {
                await compressing.tgz.compressFile(sourcePath, archivePath, { ignoreBase: true });
            }
            break;
        case 'asar':
            await asar.createPackage(sourcePath, archivePath);
            break;
    }
}

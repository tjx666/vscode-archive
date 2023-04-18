import fs from 'node:fs/promises';
import path from 'node:path';

import asar from 'asar';
import compressing from 'compressing';

import { decompressCrx } from './decompressCrx';
import { pathExists } from './fsUtils';

export async function decompress(archivePath: string, dest: string) {
    // .zip -> zip
    const archiveExt = path.extname(archivePath).toLowerCase().slice(1);
    const destExt = path.extname(dest);
    const tempFile = path.resolve(
        path.dirname(dest),
        `${path.basename(dest, destExt)}.decompressing${destExt}`,
    );

    async function clear() {
        if (await pathExists(tempFile)) {
            await fs.rm(tempFile, { recursive: true });
        }
    }

    if (await pathExists(tempFile)) {
        await fs.rm(tempFile, { recursive: true });
    }

    try {
        switch (archiveExt) {
            case 'zip':
            case 'vsix':
                await compressing.zip.decompress(archivePath, tempFile);
                break;
            case 'asar':
                asar.extractAll(archivePath, tempFile);
                break;
            case 'tgz':
                await compressing.tgz.decompress(archivePath, tempFile);
                break;
            case 'gzip':
                await compressing.gzip.decompress(archivePath, tempFile);
                break;
            case 'tar':
                await compressing.tar.decompress(archivePath, tempFile);
                break;
            // crx
            default:
                await decompressCrx(archivePath, tempFile);
        }
    } catch (error) {
        await clear();
        throw error;
    }

    await fs.rename(tempFile, dest);
}

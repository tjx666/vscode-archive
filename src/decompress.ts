import fs from 'node:fs/promises';
import path from 'node:path';

import asar from 'asar';
import compressing from 'compressing';

import { pathExists } from './fsUtils';
import unzip from './unzip';

export async function decompress(archivePath: string, dest: string) {
    const archiveExt = path.extname(archivePath).toLowerCase();
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
            case '.asar': {
                asar.extractAll(archivePath, tempFile);
                break;
            }
            case '.zp': {
                await compressing.zip.decompress(archivePath, tempFile);
                break;
            }
            case '.tgz': {
                await compressing.tgz.decompress(archivePath, tempFile);
                break;
            }
            case '.gzip': {
                await compressing.gzip.decompress(archivePath, tempFile);
                break;
            }
            case '.tar': {
                await compressing.tar.decompress(archivePath, tempFile);
                break;
            }
            default: {
                await unzip(archivePath, tempFile);
            }
        }
    } catch (error) {
        await clear();
        throw error;
    }

    await fs.rename(tempFile, dest);
}

import fs from 'node:fs/promises';
import path from 'node:path';
import asar from 'asar';

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
        if (archiveExt === '.asar') {
            asar.extractAll(archivePath, tempFile);
        } else {
            await unzip(archivePath, tempFile);
        }
    } catch (error) {
        await clear();
        throw error;
    }

    await fs.rename(tempFile, dest);
}

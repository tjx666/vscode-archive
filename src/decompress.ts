import { createReadStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import unzipper from 'unzipper';

import { pathExists } from './fsUtils';
import unzipCrx from './unzipCrx';

export async function decompress(archivePath: string, dest: string) {
    const archiveExt = path.extname(archivePath);
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

    if (archiveExt.toLowerCase() === '.crx') {
        try {
            await unzipCrx(archivePath, tempFile);
        } catch(error) {
            await clear();
            return;
        }
    } else {
        const extractTask = new Promise((resolve, reject) => {
            const extractor = unzipper.Extract({ path: tempFile });

            extractor.on('error', async (error) => {
                await clear();
                reject(error);
            });

            extractor.on('close', function () {
                resolve(undefined);
            });

            createReadStream(archivePath).pipe(extractor);
        });

        await extractTask;
    }

    await fs.rename(tempFile, dest);
}

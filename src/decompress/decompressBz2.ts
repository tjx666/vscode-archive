import { dirname } from 'node:path';

import { execa } from 'execa';

import { checkBz2Exists, command } from '../compress/compressBz2';

export async function decompressBz2(archivePath: string) {
    await checkBz2Exists(async () => {
        await execa(command, ['--keep', '--decompress', archivePath], {
            cwd: dirname(archivePath),
        });
    });
}

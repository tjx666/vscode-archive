import { dirname } from 'node:path';

import { execa } from 'execa';

import { check7zExists, command } from '../compress/compress7z';

export async function decompress7z(archivePath: string) {
    await check7zExists(async () => {
        await execa(command, ['x', archivePath], {
            cwd: dirname(archivePath),
        });
    });
}

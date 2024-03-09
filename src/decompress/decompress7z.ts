import { dirname } from 'node:path';

import { execa } from 'execa';

export async function decompress7z(archivePath: string) {
    await execa('7z', ['x', archivePath], {
        cwd: dirname(archivePath),
    });
}

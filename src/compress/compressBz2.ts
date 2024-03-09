import { dirname } from 'node:path';

import { execa } from 'execa';

export async function compressBz2(sourcePath: string) {
    await execa('bzip2', ['--keep', sourcePath], {
        cwd: dirname(sourcePath),
    });
}

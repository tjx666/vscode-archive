import { dirname } from 'node:path';

import { execa } from 'execa';

export async function compress7z(sourcePath: string, dest: string) {
    await execa('7z', ['a', dest, sourcePath], {
        cwd: dirname(sourcePath),
    });
}

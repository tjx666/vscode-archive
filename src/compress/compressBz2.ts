import { dirname } from 'node:path';

import { execa } from 'execa';

import { checkAndRun } from '../utils/command';

export const command = 'bzip2';
export async function checkBz2Exists(f: () => void) {
    await checkAndRun(
        command,
        `Can't find "${command}" in your system, please install it first, google by: https://www.google.com/search?q=bzip2+window`,
        f,
    );
}

export async function compressBz2(sourcePath: string) {
    await checkBz2Exists(async () => {
        await execa(command, ['--keep', sourcePath], {
            cwd: dirname(sourcePath),
        });
    });
}

import { dirname } from 'node:path';

import { execa } from 'execa';

import { checkAndRun } from '../utils/command';

export const command = '7z';
export async function check7zExists(f: () => void) {
    await checkAndRun(
        command,
        `Can't find "${command}" in your system, please install it first, check official website: https://www.7-zip.org/`,
        f,
    );
}

export async function compress7z(sourcePath: string, dest: string) {
    await check7zExists(async () => {
        await execa(command, ['a', dest, sourcePath], {
            cwd: dirname(sourcePath),
        });
    });
}

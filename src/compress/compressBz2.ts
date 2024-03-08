import { execa } from 'execa';

export async function compressBz2(archivePath: string) {
    await execa('bzip2', ['--keep', archivePath]);
}

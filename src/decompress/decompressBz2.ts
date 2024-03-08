import { execa } from 'execa';

export async function decompressBz2(archivePath: string) {
    await execa('bzip2', ['--keep', '--decompress', archivePath]);
}

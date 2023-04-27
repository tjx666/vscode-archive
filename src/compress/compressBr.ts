import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import zlib from 'node:zlib';

export async function compressBr(archivePath: string, dest: string) {
    const readStream = fs.createReadStream(archivePath);
    const brotli = zlib.createBrotliCompress();
    const writeStream = fs.createWriteStream(dest);
    await pipeline(readStream, brotli, writeStream);
}

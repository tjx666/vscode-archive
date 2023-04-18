import fs from 'node:fs/promises';
import path from 'node:path';

import jszip from 'jszip';

import { pathExists } from './fsUtils';

/**
 * copy from https://github.com/ddramone/unzip-crx/blob/feat/crx-v3-support/src/index.js
 * https://github.com/Rob--W/crxviewer/blob/master/src/lib/crx-to-zip.js
 * Credits for the original function go to Rob--W
 */
function crxToZip(buffer: Buffer) {
    function calcLength(a: number, b: number, c: number, d: number) {
        let length = 0;

        // eslint-disable-next-line unicorn/prefer-math-trunc
        length += a << 0;
        length += b << 8;
        length += c << 16;
        length += (d << 24) >>> 0;
        return length;
    }
    // Definition of crx format: http://developer.chrome.com/extensions/crx.html
    const view = new Uint8Array(buffer);

    // 50 4b 03 04
    if (view[0] === 80 && view[1] === 75 && view[2] === 3 && view[3] === 4) {
        console.warn('Input is not a CRX file, but a ZIP file.');
        return buffer;
    }

    // 43 72 32 34
    if (view[0] !== 67 || view[1] !== 114 || view[2] !== 50 || view[3] !== 52) {
        throw new Error('Invalid header: Does not start with PK\\x03\\x04 or Cr24\n\n');
    }

    // 02 00 00 00
    // 03 00 00 00 CRX3
    if ((view[4] !== 2 && view[4] !== 3) || view[5] || view[6] || view[7]) {
        throw new Error('Unexpected crx format version number.');
    }

    let zipStartOffset;

    if (view[4] === 2) {
        const publicKeyLength = calcLength(view[8], view[9], view[10], view[11]);
        const signatureLength = calcLength(view[12], view[13], view[14], view[15]);

        // 16 = Magic number (4), CRX format version (4), lengths (2x4)
        zipStartOffset = 16 + publicKeyLength + signatureLength;
    } else {
        // view[4] === 3
        // CRX3 - https://cs.chromium.org/chromium/src/components/crx_file/crx3.proto
        const crx3HeaderLength = calcLength(view[8], view[9], view[10], view[11]);

        // 12 = Magic number (4), CRX format version (4), header length (4)
        zipStartOffset = 12 + crx3HeaderLength;
    }

    // Create a new view for the existing buffer, and wrap it in a Blob object.
    return Buffer.from(buffer, zipStartOffset);
}

export async function decompressCrx(archivePath: string, dest: string) {
    const extname = path.extname(archivePath);
    return fs
        .readFile(archivePath)
        .then((buf) => jszip.loadAsync(extname.toLowerCase() === '.crx' ? crxToZip(buf) : buf))
        .then((zip) => {
            const zipFileKeys = Object.keys(zip.files);
            return Promise.all(
                zipFileKeys.map(async (filename) => {
                    const isFile = !zip.files[filename].dir;
                    const fullPath = path.join(dest!, filename);
                    const directory = isFile ? path.dirname(fullPath) : fullPath;
                    if (!(await pathExists(directory))) {
                        await fs.mkdir(directory, { recursive: true });
                    }

                    if (isFile) {
                        const content = await zip.files[filename].async('nodebuffer');
                        if (content) {
                            return fs.writeFile(fullPath, content);
                        } else {
                            return true;
                        }
                    }
                }),
            );
        });
}

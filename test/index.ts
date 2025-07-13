// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable promise/no-callback-in-promise */
import path from 'node:path';

import { glob } from 'glob';
import Mocha from 'mocha';

// !: can't be async function
export function run(testsRoot: string, callback: (error: any, failures?: number) => void): void {
    const mocha = new Mocha({ color: true });

    glob('**/**.test.js', { cwd: testsRoot })
        .then((files) => {
            for (const f of files) {
                mocha.addFile(path.resolve(testsRoot, f));
            }

            mocha.run((failures) => {
                callback(null, failures);
            });
        })
        .catch((error) => {
            callback(error);
        });
}

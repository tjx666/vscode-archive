import fs from 'fs/promises';
import { constants as FS_CONSTANTS } from 'fs';

function pathExists(path: string) {
    return fs
        .access(path, FS_CONSTANTS.F_OK)
        .then(() => true)
        .catch(() => false);
}

export { pathExists };

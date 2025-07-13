import { strictEqual } from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { checkAndFlatten } from '../src/utils/smartFlatten';

describe('smartFlatten', () => {
    let testDir: string;

    before(() => {
        // Create temporary test directory
        testDir = join(tmpdir(), `vscode-archive-smartflatten-test-${Date.now()}`);
        mkdirSync(testDir, { recursive: true });
    });

    after(() => {
        // Clean up test directory
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe('checkAndFlatten', () => {
        it('should flatten when single folder matches archive name', async () => {
            // Setup: create a directory structure that should be flattened
            const extractDir = join(testDir, 'extract-test-1');
            const redundantFolder = join(extractDir, 'test-archive');
            const subFolder = join(redundantFolder, 'subfolder');

            mkdirSync(subFolder, { recursive: true });
            writeFileSync(join(redundantFolder, 'file1.txt'), 'content1');
            writeFileSync(join(redundantFolder, 'file2.txt'), 'content2');
            writeFileSync(join(subFolder, 'file3.txt'), 'content3');

            // Execute
            const result = await checkAndFlatten(extractDir, 'test-archive');

            // Verify
            strictEqual(result, true);

            // Check that files are now in the extract directory
            const entries = await readdir(extractDir);
            strictEqual(entries.includes('file1.txt'), true);
            strictEqual(entries.includes('file2.txt'), true);
            strictEqual(entries.includes('subfolder'), true);
            strictEqual(entries.includes('test-archive'), false); // Redundant folder should be gone

            // Check subfolder still exists and contains file
            const subEntries = await readdir(join(extractDir, 'subfolder'));
            strictEqual(subEntries.includes('file3.txt'), true);
        });

        it('should not flatten when folder name does not match archive name', async () => {
            // Setup: create a directory structure that should NOT be flattened
            const extractDir = join(testDir, 'extract-test-2');
            const wrongNameFolder = join(extractDir, 'different-name');

            mkdirSync(wrongNameFolder, { recursive: true });
            writeFileSync(join(wrongNameFolder, 'file1.txt'), 'content1');

            // Execute
            const result = await checkAndFlatten(extractDir, 'test-archive');

            // Verify
            strictEqual(result, false);

            // Check that original structure is preserved
            const entries = await readdir(extractDir);
            strictEqual(entries.includes('different-name'), true);
            strictEqual(entries.includes('file1.txt'), false); // Should still be inside the folder
        });

        it('should not flatten when multiple top-level items exist', async () => {
            // Setup: create multiple top-level items
            const extractDir = join(testDir, 'extract-test-3');
            const folder = join(extractDir, 'test-archive');

            mkdirSync(folder, { recursive: true });
            writeFileSync(join(folder, 'file1.txt'), 'content1');
            writeFileSync(join(extractDir, 'file2.txt'), 'content2'); // Another top-level item

            // Execute
            const result = await checkAndFlatten(extractDir, 'test-archive');

            // Verify
            strictEqual(result, false);

            // Check that original structure is preserved
            const entries = await readdir(extractDir);
            strictEqual(entries.includes('test-archive'), true);
            strictEqual(entries.includes('file2.txt'), true);
        });

        it('should not flatten when top-level item is a file', async () => {
            // Setup: create a single top-level file
            const extractDir = join(testDir, 'extract-test-4');
            mkdirSync(extractDir, { recursive: true });
            writeFileSync(join(extractDir, 'test-archive.txt'), 'content'); // File, not folder

            // Execute
            const result = await checkAndFlatten(extractDir, 'test-archive');

            // Verify
            strictEqual(result, false);

            // Check that file is preserved
            const entries = await readdir(extractDir);
            strictEqual(entries.includes('test-archive.txt'), true);
        });

        it('should handle empty directories gracefully', async () => {
            // Setup: create empty directory
            const extractDir = join(testDir, 'extract-test-5');
            mkdirSync(extractDir, { recursive: true });

            // Execute
            const result = await checkAndFlatten(extractDir, 'test-archive');

            // Verify
            strictEqual(result, false);
        });

        it('should handle nested empty folders', async () => {
            // Setup: create nested structure with empty folder that matches name
            const extractDir = join(testDir, 'extract-test-6');
            const emptyFolder = join(extractDir, 'test-archive');

            mkdirSync(emptyFolder, { recursive: true });

            // Execute
            const result = await checkAndFlatten(extractDir, 'test-archive');

            // Verify
            strictEqual(result, true); // Should flatten even if empty

            // Check that folder is gone
            const entries = await readdir(extractDir);
            strictEqual(entries.length, 0);
        });
    });
});

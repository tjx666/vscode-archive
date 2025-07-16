import { strictEqual } from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, normalize } from 'node:path';

import vscode from 'vscode';

import {
    ensureExtension,
    fileExists,
    generateBaseName,
    generateDefaultName,
    getCommonDirectory,
    getCommonPath,
    getCommonPrefix,
    getUniqueFileName,
    getUniqueFileNameSync,
    validateFileName,
} from '../src/utils/fileUtils';

/**
 * 规范化路径进行跨平台比较 在 Windows 上将反斜杠转换为正斜杠以保持测试一致性
 */
function normalizePath(path: string): string {
    return normalize(path).replaceAll('\\', '/');
}

/**
 * 断言两个路径相等，会先规范化路径格式
 */
function assertPathEqual(actual: string | null, expected: string): void {
    if (actual === null) {
        strictEqual(actual, expected);
        return;
    }

    // 如果期望值是空字符串，直接比较
    if (expected === '') {
        strictEqual(actual, expected);
        return;
    }

    strictEqual(normalizePath(actual), expected);
}

describe('fileUtils', () => {
    let testDir: string;

    before(() => {
        // 创建临时测试目录
        testDir = join(tmpdir(), `vscode-archive-test-${Date.now()}`);
        mkdirSync(testDir, { recursive: true });
    });

    after(() => {
        // 清理测试目录
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe('fileExists', () => {
        it('should return true for existing file', async () => {
            const testFile = join(testDir, 'existing-file.txt');
            writeFileSync(testFile, 'test content');

            const result = await fileExists(testFile);
            strictEqual(result, true);
        });

        it('should return false for non-existing file', async () => {
            const nonExistingFile = join(testDir, 'non-existing-file.txt');

            const result = await fileExists(nonExistingFile);
            strictEqual(result, false);
        });
    });

    describe('getUniqueFileName', () => {
        it('should return original name if file does not exist', async () => {
            const result = await getUniqueFileName(testDir, 'unique-file', 'txt');
            strictEqual(result, 'unique-file.txt');
        });

        it('should append number if file exists', async () => {
            // 创建冲突文件
            const conflictFile = join(testDir, 'conflict-file.txt');
            writeFileSync(conflictFile, 'test');

            const result = await getUniqueFileName(testDir, 'conflict-file', 'txt');
            strictEqual(result, 'conflict-file-1.txt');
        });

        it('should increment number for multiple conflicts', async () => {
            // 创建多个冲突文件
            writeFileSync(join(testDir, 'multi-conflict.txt'), 'test');
            writeFileSync(join(testDir, 'multi-conflict-1.txt'), 'test');
            writeFileSync(join(testDir, 'multi-conflict-2.txt'), 'test');

            const result = await getUniqueFileName(testDir, 'multi-conflict', 'txt');
            strictEqual(result, 'multi-conflict-3.txt');
        });
    });

    describe('getUniqueFileNameSync', () => {
        it('should return original name if file does not exist', () => {
            const result = getUniqueFileNameSync(testDir, 'sync-unique-file.txt');
            strictEqual(result, 'sync-unique-file.txt');
        });

        it('should append number if file exists', () => {
            const conflictFile = join(testDir, 'sync-conflict.txt');
            writeFileSync(conflictFile, 'test');

            const result = getUniqueFileNameSync(testDir, 'sync-conflict.txt');
            strictEqual(result, 'sync-conflict-1.txt');
        });

        it('should handle files with multiple extensions', () => {
            const conflictFile = join(testDir, 'complex.tar.gz');
            writeFileSync(conflictFile, 'test');

            const result = getUniqueFileNameSync(testDir, 'complex.tar.gz');
            strictEqual(result, 'complex.tar-1.gz');
        });
    });

    describe('validateFileName', () => {
        it('should return undefined for valid filename', () => {
            const result = validateFileName('valid-filename', 'zip');
            strictEqual(result, undefined);
        });

        it('should return error for empty filename', () => {
            const result = validateFileName('', 'zip');
            strictEqual(result, 'File name cannot be empty');
        });

        it('should return error for whitespace-only filename', () => {
            const result = validateFileName('   ', 'zip');
            strictEqual(result, 'File name cannot be empty');
        });

        it('should return error for filename with invalid characters', () => {
            const invalidChars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

            for (const char of invalidChars) {
                const result = validateFileName(`invalid${char}name`, 'zip');
                strictEqual(result, 'File name contains invalid characters');
            }
        });

        it('should return error for filename that is too long', () => {
            const longName = 'a'.repeat(256);
            const result = validateFileName(longName, 'zip');
            strictEqual(result, 'File name is too long');
        });
    });

    describe('ensureExtension', () => {
        it('should add extension if missing', () => {
            const result = ensureExtension('filename', 'zip');
            strictEqual(result, 'filename.zip');
        });

        it('should not add extension if already present', () => {
            const result = ensureExtension('filename.zip', 'zip');
            strictEqual(result, 'filename.zip');
        });

        it('should replace wrong extension', () => {
            const result = ensureExtension('filename.txt', 'zip');
            strictEqual(result, 'filename.zip');
        });

        it('should handle multiple extensions', () => {
            const result = ensureExtension('filename.tar.gz', 'zip');
            strictEqual(result, 'filename.tar.zip');
        });

        it('should handle filename without extension', () => {
            const result = ensureExtension('filename_no_ext', 'tar');
            strictEqual(result, 'filename_no_ext.tar');
        });
    });

    describe('generateBaseName', () => {
        function createMockUri(path: string): vscode.Uri {
            return vscode.Uri.file(path);
        }

        it('should use directory name when all files in same directory', () => {
            const uris = [
                createMockUri('/workspace/src/file1.js'),
                createMockUri('/workspace/src/file2.js'),
            ];

            const result = generateBaseName(uris);
            strictEqual(result, 'src');
        });

        it('should use common parent directory name', () => {
            const uris = [
                createMockUri('/workspace/project/src/main.js'),
                createMockUri('/workspace/project/lib/utils.js'),
                createMockUri('/workspace/project/README.md'),
            ];

            const result = generateBaseName(uris);
            strictEqual(result, 'project');
        });

        it('should use common prefix from filenames', () => {
            const uris = [
                createMockUri('/workspace/user-profile.js'),
                createMockUri('/home/user-settings.js'),
                createMockUri('/tmp/user-auth.js'),
            ];

            const result = generateBaseName(uris);
            strictEqual(result, 'user');
        });

        it('should return "archive" for unrelated files', () => {
            const uris = [
                createMockUri('/workspace/main.js'),
                createMockUri('/desktop/photo.jpg'),
                createMockUri('/documents/readme.txt'),
            ];

            const result = generateBaseName(uris);
            strictEqual(result, 'archive');
        });

        it('should handle single character common prefix', () => {
            const uris = [createMockUri('/workspace/a1.js'), createMockUri('/home/a2.js')];

            const result = generateBaseName(uris);
            strictEqual(result, 'archive'); // Should fallback because prefix is too short
        });
    });

    describe('getCommonDirectory', () => {
        function createMockUri(path: string): vscode.Uri {
            return vscode.Uri.file(path);
        }

        it('should return null for empty array', () => {
            const result = getCommonDirectory([]);
            strictEqual(result, null);
        });

        it('should return directory for single file', () => {
            const uris = [createMockUri('/workspace/src/file.js')];
            const result = getCommonDirectory(uris);
            assertPathEqual(result, '/workspace/src/file.js');
        });

        it('should find common directory path', () => {
            const uris = [
                createMockUri('/workspace/project/src/main.js'),
                createMockUri('/workspace/project/lib/utils.js'),
                createMockUri('/workspace/project/README.md'),
            ];

            const result = getCommonDirectory(uris);
            assertPathEqual(result, '/workspace/project');
        });

        it('should handle files with no common directory', () => {
            const uris = [createMockUri('/workspace/file1.js'), createMockUri('/desktop/file2.js')];

            const result = getCommonDirectory(uris);
            strictEqual(result, '');
        });
    });

    describe('getCommonPath', () => {
        it('should find common path between two identical paths', () => {
            const result = getCommonPath('/workspace/project', '/workspace/project');
            assertPathEqual(result, '/workspace/project');
        });

        it('should find common path between different paths', () => {
            const result = getCommonPath('/workspace/project/src', '/workspace/project/lib');
            assertPathEqual(result, '/workspace/project');
        });

        it('should return empty string for completely different paths', () => {
            const result = getCommonPath('/workspace/project', '/desktop/files');
            strictEqual(result, '');
        });

        it('should handle root paths', () => {
            const result = getCommonPath('/workspace', '/workspace/project');
            assertPathEqual(result, '/workspace');
        });
    });

    describe('getCommonPrefix', () => {
        it('should return empty string for empty array', () => {
            const result = getCommonPrefix([]);
            strictEqual(result, '');
        });

        it('should return the string for single item array', () => {
            const result = getCommonPrefix(['hello']);
            strictEqual(result, 'hello');
        });

        it('should find common prefix', () => {
            const result = getCommonPrefix(['user-profile', 'user-settings', 'user-auth']);
            strictEqual(result, 'user-');
        });

        it('should return empty string when no common prefix', () => {
            const result = getCommonPrefix(['apple', 'banana', 'cherry']);
            strictEqual(result, '');
        });

        it('should handle partial matches', () => {
            const result = getCommonPrefix(['test123', 'test456', 'test789']);
            strictEqual(result, 'test');
        });

        it('should handle one string being prefix of another', () => {
            const result = getCommonPrefix(['test', 'testing', 'tester']);
            strictEqual(result, 'test');
        });
    });

    describe('generateDefaultName', () => {
        function createMockUri(path: string): vscode.Uri {
            return vscode.Uri.file(path);
        }

        it('should use original filename for single file', async () => {
            const uris = [createMockUri(join(testDir, 'single-file.txt'))];

            const result = await generateDefaultName(uris, 'zip');
            strictEqual(result, 'single-file.zip');
        });

        it('should handle single file with existing archive', async () => {
            const sourceFile = join(testDir, 'existing-source.txt');
            const conflictArchive = join(testDir, 'existing-source.zip');

            writeFileSync(sourceFile, 'content');
            writeFileSync(conflictArchive, 'archive');

            const uris = [vscode.Uri.file(sourceFile)];
            const result = await generateDefaultName(uris, 'zip');
            strictEqual(result, 'existing-source-1.zip');
        });

        it('should use intelligent naming for multiple files', async () => {
            // Create a subdirectory for this test
            const subDir = join(testDir, 'multi-test-dir');
            mkdirSync(subDir, { recursive: true });

            const uris = [
                vscode.Uri.file(join(subDir, 'file1.js')),
                vscode.Uri.file(join(subDir, 'file2.js')),
            ];

            const result = await generateDefaultName(uris, 'zip');
            strictEqual(result, 'multi-test-dir.zip');
        });
    });
});

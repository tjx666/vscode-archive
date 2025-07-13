import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Check and perform smart flattening if applicable
 *
 * @param extractedPath Path to the extracted directory
 * @param archiveName Archive filename (without extension)
 * @returns Whether flattening was performed
 */
export async function checkAndFlatten(
    extractedPath: string,
    archiveName: string,
): Promise<boolean> {
    try {
        // Read contents of the extracted directory
        const entries = await fs.readdir(extractedPath, { withFileTypes: true });

        // Must have exactly one entry and it must be a directory
        if (entries.length !== 1 || !entries[0].isDirectory()) {
            return false;
        }

        const folderName = entries[0].name;

        // Folder name must match archive name
        if (folderName !== archiveName) {
            return false;
        }

        // Perform flattening operation
        await flattenFolder(extractedPath, folderName);
        return true;
    } catch (error) {
        console.warn('Failed to check or flatten extracted folder:', error);
        return false;
    }
}

/**
 * Perform folder flattening operation Move subfolder contents to parent directory, then remove empty subfolder
 */
async function flattenFolder(parentPath: string, folderName: string): Promise<void> {
    const folderPath = path.join(parentPath, folderName);
    const tempPath = path.join(parentPath, `._${folderName}_temp`);

    try {
        // 1. Rename original folder to temporary name
        await fs.rename(folderPath, tempPath);

        // 2. Read all contents from temporary folder
        const items = await fs.readdir(tempPath, { withFileTypes: true });

        // 3. Move all contents to parent directory

        const movePromises = items.map(async (item) => {
            const sourcePath = path.join(tempPath, item.name);
            const targetPath = path.join(parentPath, item.name);
            return fs.rename(sourcePath, targetPath);
        });

        await Promise.all(movePromises);

        // 4. Remove empty temporary folder
        await fs.rmdir(tempPath);
    } catch (error) {
        // If error occurs, try to restore original folder name
        try {
            await fs.rename(tempPath, folderPath);
        } catch {
            // If restoration fails, there's nothing more we can do
        }
        throw error;
    }
}

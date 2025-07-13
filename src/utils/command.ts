import commandExists from 'command-exists';
import vscode from 'vscode';

export async function checkCommandExisted(commandName: string) {
    try {
        await commandExists(commandName);
    } catch {
        return false;
    }
    return true;
}

export async function checkAndRun(command: string, message: string, f: () => void) {
    if (await checkCommandExisted(command)) {
        await f();
    } else {
        await vscode.window.showErrorMessage(message);
    }
}

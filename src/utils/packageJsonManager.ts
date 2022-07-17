import * as vscode from 'vscode';
import { VERSIONS } from '../constants/constants';
import { updateType } from '../extension';
// https://stackoverflow.com/questions/36316326/typescript-ts7015-error-when-accessing-an-enum-using-a-string-type-parameter

console.log('updateType', updateType);

// const exec = require('child_process').exec;

const getPackageJsonFilePath = async () => {
    return await vscode.workspace.findFiles(
        '**/package.json',
        '**/node_modules/**/package.json'
    );
};

// TODO: may not work if there is somehow a version number that is the same as the one that we are editing
// and it appears before the real package.json version number
const getRangeOfSubstring = (text: string, substring: string): vscode.Range => {
    const firstIndex = text.indexOf(substring);
    const sub = text.substring(0, firstIndex);
    const numLines = sub.split('\n').length - 1; // vscode is 0-indexed for line numbers
    const subsub = sub.substring(sub.lastIndexOf('\n'));
    const startOffset = subsub.length - 1;
    const endOffset = startOffset + substring.length;
    return new vscode.Range(
        new vscode.Position(numLines, startOffset),
        new vscode.Position(numLines, endOffset)
    );
};

// const deprecatedUpdatePackageJsonWithTerminal = async () => {
// try {
//     console.log('string', 'npm version ' + updateType + ' -m \"Automated Version Update to %s\"')
//     const command = 'npm version ' + updateType + ' -m \"Automated Version Update to %s\"'
//     vscode.window.activeTerminal ?
//         vscode.window.activeTerminal.sendText(command, true) :
//         await updatePackageJsonWithTextDocument()
//     // const result = await exec()
//     // console.log('exec finished?', result)
// }
// catch(error) {
//     console.error('no exec', error)
// }
// }

export const updatePackageJson = async () => {
    try {
        const packageJsonUri: vscode.Uri = (await getPackageJsonFilePath())[0];
        const packageJsonDocument = await vscode.workspace.openTextDocument(
            packageJsonUri
        );
        let rawText = packageJsonDocument.getText();
        let text = JSON.parse(rawText);
        let versionText = text.version;
        let updatedVersion = incrementVersionNumber(versionText);
        text.version = updatedVersion;
        const wsEdit = new vscode.WorkspaceEdit();
        wsEdit.replace(
            packageJsonUri,
            getRangeOfSubstring(rawText, versionText),
            updatedVersion
        );
        vscode.workspace.applyEdit(wsEdit);
    } catch (error) {
        console.error('Something went wrong', error);
        throw error;
    }
};

const incrementValue = (indexedString: string): string => {
    return `${parseInt(indexedString) + 1}`;
};

// TODO: validation for package version number (assuming x.x.x format, but not 1000% sure)
const incrementVersionNumber = (currentVersion: string): string => {
    let splitVersion: string[] = currentVersion.split('.');
    splitVersion[VERSIONS[updateType as keyof typeof VERSIONS]] =
        incrementValue(
            splitVersion[VERSIONS[updateType as keyof typeof VERSIONS]]
        );
    switch (updateType) {
        case 'major':
            splitVersion[VERSIONS['minor']] = '0';
        case 'minor':
            splitVersion[VERSIONS['patch']] = '0';
    }
    console.log('bazinga', splitVersion.join('.'));
    return splitVersion.join('.');
};

export const hasPackageJson = async (): Promise<boolean> => {
    if (vscode.workspace.workspaceFolders) {
        return (await getPackageJsonFilePath()).length > 0;
    }
    return false;
};

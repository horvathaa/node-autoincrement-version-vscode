// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
console.log('gitExtension', gitExtension)
export const gitApi = gitExtension?.getAPI(1);
console.log('gitApi', gitApi);
// https://stackoverflow.com/questions/36316326/typescript-ts7015-error-when-accessing-an-enum-using-a-string-type-parameter
let updateType: string | keyof typeof VERSIONS = vscode.workspace.getConfiguration('version').get('options') ?? 'patch' ;
console.log('updateType', updateType)

enum VERSIONS {
	'major',
	'minor',
	'patch'
}

const getPackageJsonFilePath = async () => {
	return await vscode.workspace.findFiles('**/package.json', '**/node_modules/**/package.json');
};

// TODO: may not work if there is somehow a version number that is the same as the one that we are editing
// and it appears before the real package.json version number
const getRangeOfSubstring = (text: string, substring: string) : vscode.Range => {
	const firstIndex = text.indexOf(substring);
	const sub = text.substring(0, firstIndex);
	const numLines = sub.split('\n').length - 1; // vscode is 0-indexed for line numbers
	const subsub = sub.substring(sub.lastIndexOf('\n'));
	const startOffset = subsub.length - 1;
	const endOffset = startOffset + substring.length;
	return new vscode.Range(new vscode.Position(numLines, startOffset), new vscode.Position(numLines, endOffset));
};

const updatePackageJson = async () => {
	const packageJsonUri: vscode.Uri = (await getPackageJsonFilePath())[0];
	const packageJsonDocument = (await vscode.workspace.openTextDocument(packageJsonUri));
	let rawText = packageJsonDocument.getText();
	let text = JSON.parse(rawText);
	let versionText = text.version;
	let updatedVersion = incrementVersionNumber(versionText);
	text.version = updatedVersion;
	const wsEdit = new vscode.WorkspaceEdit();
	wsEdit.replace(packageJsonUri, getRangeOfSubstring(rawText, versionText), updatedVersion);
	vscode.workspace.applyEdit(wsEdit);
};

const incrementValue = (indexedString: string) : string => {
	return `${parseInt(indexedString) + 1}`;
}

// TODO: validation for package version number (assuming x.x.x format, but not 1000% sure)
const incrementVersionNumber = (currentVersion: string) : string => {
	let splitVersion: string[] = currentVersion.split('.');
	splitVersion[VERSIONS[updateType as keyof typeof VERSIONS]] = incrementValue(splitVersion[VERSIONS[updateType as keyof typeof VERSIONS]]);
	switch(updateType) {
		case 'major':
			splitVersion[VERSIONS['minor']] = '0';
		case 'minor':
			splitVersion[VERSIONS['patch']] = '0';
	}
	console.log('bazinga',  splitVersion.join('.'));
	return splitVersion.join('.');
};

const configDidChange = () => {
	updateType = vscode.workspace.getConfiguration('version').get('options') ?? 'patch';
	console.log('new update', updateType);
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	if(!(await hasPackageJson())) {
		deactivate();
	}
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "node-autoincrement-version" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('node-autoincrement-version.helloWorld', updatePackageJson);
	
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => configDidChange()));

	context.subscriptions.push(disposable);
}

const hasPackageJson = async () : Promise<boolean> => {
	if(vscode.workspace.workspaceFolders) {
		return (await getPackageJsonFilePath()).length > 0;
	}
	return false;
};

// this method is called when your extension is deactivated
export function deactivate() {}

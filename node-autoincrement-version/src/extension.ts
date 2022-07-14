// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
console.log('gitExtension', gitExtension)
export const gitApi = gitExtension?.getAPI(1);
console.log('gitApi', gitApi);

const getPackageJsonFilePath = async () => {
	return await vscode.workspace.findFiles('**/package.json', '**/node_modules/**/package.json');
}

const updatePackageJson = async () => {
	// The code you place here will be executed every time your command is executed
	// Display a message box to the user
	const packageJsonUri: vscode.Uri = (await getPackageJsonFilePath())[0];
	const packageJsonDocument = (await vscode.workspace.openTextDocument(packageJsonUri));
	let text = packageJsonDocument.getText();
	console.log('packageJsonDocument', text)
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

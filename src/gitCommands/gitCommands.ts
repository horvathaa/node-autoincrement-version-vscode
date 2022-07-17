import * as vscode from 'vscode';
import { updatePackageJson } from '../utils/packageJsonManager';

const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
console.log('gitExtension', gitExtension);
export const gitApi = gitExtension?.getAPI(1);
console.log('gitApi', gitApi);
let lastCommitHash: string = '';

export const listenForGitCommit = async () => {
    await gitApi.repositories?.forEach(async (r: any) => {
        r?.state?.onDidChange(async () => {
            // const currentProjectName: string = getProjectName(r?.rootUri?.path)
            if (lastCommitHash === '') {
                lastCommitHash = r.state.HEAD.commit;
            } else if (lastCommitHash !== r.state.HEAD.commit) {
                try {
                    updatePackageJson();
                } catch (error) {
                    console.error('Could not update package', error);
                }
                lastCommitHash = r.state.HEAD.commit;
            }
        });
    });
};

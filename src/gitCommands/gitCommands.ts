import * as vscode from 'vscode';
import { updatePackageJson } from '../utils/packageJsonManager';

const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
console.log('gitExtension', gitExtension);
export const gitApi = gitExtension?.getAPI(1);
console.log('gitApi', gitApi);
let lastCommitHash: string = '';

export const listenForGitCommit = async () => {
    let curRunning = false;
    await gitApi.repositories?.forEach(async (r: any) => {
        r?.state?.onDidChange(async () => {
            console.log('curRunnign', curRunning);
            // const currentProjectName: string = getProjectName(r?.rootUri?.path)
            if (lastCommitHash === '') {
                lastCommitHash = r.state.HEAD.commit;
            } else if (
                lastCommitHash !== r.state.HEAD.commit &&
                !curRunning &&
                r.inputBox.value !== 'HELLO!!!!!'
            ) {
                curRunning = true;

                try {
                    console.log(
                        'at top of else if = lastCommitHash',
                        lastCommitHash,
                        'r.state.head',
                        r.state.HEAD.commit
                    );
                    await updatePackageJson();
                    setTimeout(async () => {
                        const result = await vscode.commands.executeCommand(
                            'git.stageAll'
                        );
                        r.inputBox.value = 'HELLO!!!!!';
                        const gitCommitResult =
                            await vscode.commands.executeCommand('git.commit');
                    }, 10000);
                } catch (error) {
                    console.error('Could not update package', error);
                }
                curRunning = false;
                lastCommitHash = r.state.HEAD.commit;
            }
            // console.log('headstate', lastCommitHash, r.state.HEAD.commit);
        });
    });
};

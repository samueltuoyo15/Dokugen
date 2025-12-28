import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import {
  detectProjectType,
  getUserInfo,
  getGitRepoUrl,
  scanFiles,
  checkInternetConnection,
  generateReadmeCore
} from 'dokugen';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('DokuGen');

  let disposable = vscode.commands.registerCommand('dokugen.generate', async (folderUri: vscode.Uri) => {
    let workspaceFolder: vscode.WorkspaceFolder | undefined;

    if (folderUri) {
      workspaceFolder = vscode.workspace.getWorkspaceFolder(folderUri);
    } else {
      workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    }

    if (!workspaceFolder) {
      vscode.window.showErrorMessage('Please open a folder in your workspace to run DokuGen');
      return;
    }

    const projectDir = workspaceFolder.uri.fsPath;
    const readmePath = path.join(projectDir, "README.md");

    try {
      // 1. Check Internet Connection
      const hasInternet = await checkInternetConnection();
      if (!hasInternet) {
        vscode.window.showErrorMessage('Opps... kindly check your device or pc internet connection and try again.');
        return;
      }

      // 2. Interactive UI for Options
      const includeSetup = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Do you want to include setup instructions in the README?',
      });
      if (includeSetup === undefined) return;

      const includeContribution = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Include contribution guidelines in README?',
      });
      if (includeContribution === undefined) return;

      // 3. Generation Process with Progress
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "DokuGen: Generating README",
        cancellable: false
      }, async (progress) => {
        outputChannel.clear();
        outputChannel.show();

        progress.report({ message: "Detecting project type..." });
        const projectType = await detectProjectType(projectDir);
        outputChannel.appendLine(`Detected project type: ${projectType}`);

        progress.report({ message: "Scanning project files..." });
        const projectFiles = await scanFiles(projectDir);
        outputChannel.appendLine(`Found: ${projectFiles.length} files in the project`);

        const userInfo = getUserInfo();
        const repoUrl = getGitRepoUrl();

        progress.report({ message: "Generating content..." });

        await generateReadmeCore(
          {
            projectType,
            projectFiles,
            projectDir,
            userInfo,
            repoUrl,
            options: {
              includeSetup: includeSetup === 'Yes',
              includeContributionGuideLine: includeContribution === 'Yes'
            },
          },
          readmePath,
          {
            onProgress: (text: string) => {
              outputChannel.appendLine(text);
              progress.report({ message: text });
            },
            onChunk: (chunk: string) => {
              // Optionally log chunks or update output channel
              // outputChannel.append(chunk);
            },
            onSuccess: (text: string) => {
              outputChannel.appendLine(`Success: ${text}`);
            },
            onError: (text: string, err: any) => {
              outputChannel.appendLine(`Error: ${text}`);
              if (err) outputChannel.appendLine(JSON.stringify(err, null, 2));
              vscode.window.showErrorMessage(`DokuGen Error: ${text}`);
            }
          }
        );

        // 4. Open the generated file
        const doc = await vscode.workspace.openTextDocument(readmePath);
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage('README.md generated successfully!');
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to generate README: ${error.message}`);
      outputChannel.appendLine(`Fatal Error: ${error.stack}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }
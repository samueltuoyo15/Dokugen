import * as vscode from 'vscode'
import { exec } from 'child_process'

const checkAndRunDokugen = async (folderPath: string) => {
  const terminal = vscode.window.createTerminal({
    name: 'DokuGen',
    cwd: folderPath
  })

  terminal.show()

  exec('dokugen --version', async (error) => {
    if (error) {
   
      terminal.sendText('npm install -g dokugen')
      await new Promise(resolve => setTimeout(resolve, 3000)) 
 
      terminal.sendText('dokugen generate')
    } else {

      terminal.sendText('dokugen generate')
    }
  })
}

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand('dokugen.generate', (folderUri: vscode.Uri) => {
    let workspaceFolder: vscode.WorkspaceFolder | undefined

    if (folderUri) {
      workspaceFolder = vscode.workspace.getWorkspaceFolder(folderUri)
    } else {
      workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    }

    if (!workspaceFolder) {
      vscode.window.showErrorMessage('Please open a folder in your workspace to run DokuGen')
      return
    }

    const folderPath = workspaceFolder.uri.fsPath

    checkAndRunDokugen(folderPath)
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {}
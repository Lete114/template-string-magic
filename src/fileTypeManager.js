const vscode = require('vscode')
const { StatusBar } = require('./statusBar')

module.exports = { toggleFileType, initializeFileTypeManager }

/** @type {InstanceType<typeof StatusBar>} */
let statusBar

/** @type { () => void } */
let updateStatusBarIcon

/**
 *
 * @param {vscode.ExtensionContext} context
 */
function initializeFileTypeManager(context) {
  const globalState = context.globalState

  // eslint-disable-next-line max-statements
  const toggleFileType = async () => {
    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const fileType = activeEditor.document.languageId

      const confirm = await vscode.window.showInformationMessage(
        `Do you want to add or remove the current file type (${fileType})?`,
        'Add',
        'Remove',
        'Cancel'
      )

      if (confirm === 'Add') {
        let fileTypes = globalState.get('fileTypes', [])

        if (!fileTypes.includes(fileType)) {
          fileTypes.push(fileType)
          globalState.update('fileTypes', fileTypes)
          vscode.window.showInformationMessage(`File type ${fileType} added!`)
        } else {
          vscode.window.showInformationMessage(
            `File type ${fileType} already exists!`
          )
        }
      } else if (confirm === 'Remove') {
        let fileTypes = globalState.get('fileTypes', [])

        if (fileTypes.includes(fileType)) {
          fileTypes = fileTypes.filter((type) => type !== fileType)
          globalState.update('fileTypes', fileTypes)
          vscode.window.showInformationMessage(`File type ${fileType} removed!`)
        } else {
          vscode.window.showInformationMessage(
            `File type ${fileType} not found!`
          )
        }
      }
      updateStatusBarIcon()
      showFileTypes()
    } else {
      vscode.window.showWarningMessage('No active editor found!')
    }
  }

  function showFileTypes() {
    const fileTypes = globalState.get('fileTypes', [])
    if (fileTypes.length > 0) {
      vscode.window.showInformationMessage(
        `Saved file types: ${fileTypes.join(', ')}`
      )
    } else {
      vscode.window.showInformationMessage('No file types saved.')
    }
  }

  return { toggleFileType }
}

/**
 *
 * @param {vscode.ExtensionContext} context
 */
function toggleFileType(context) {
  statusBar = new StatusBar(context)

  updateStatusBarIcon = () => {
    const activeEditor = vscode.window.activeTextEditor
    const fileTypes = context.globalState.get('fileTypes', [])

    if (activeEditor) {
      const fileType = activeEditor.document.languageId

      // If the fileTypes array is empty or includes the current file type,
      // it means the extension applies to the current file type.
      if (fileTypes.length === 0 || fileTypes.includes(fileType)) {
        statusBar.update('Success')
      } else {
        statusBar.update('Disabled')
      }
    } else {
      statusBar.update('Disabled')
    }
  }

  vscode.window.onDidChangeActiveTextEditor(
    updateStatusBarIcon,
    null,
    context.subscriptions
  )

  updateStatusBarIcon()

  const fileTypeManager = initializeFileTypeManager(context)

  const disposable = vscode.commands.registerCommand(
    'TemplateStringMagic.toggleFileType',
    fileTypeManager.toggleFileType
  )
  context.subscriptions.push(disposable)
}

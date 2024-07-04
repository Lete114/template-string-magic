const { magic } = require('./magic')

const vscode = require('vscode')

/**
 *
 * @param { vscode.TextDocumentChangeEvent } event
 * @returns
 */
// eslint-disable-next-line max-statements
async function onDidChangeTextDocument(event) {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }

  const document = editor.document

  // Get the changes
  const changes = event.contentChanges
  if (changes.length === 0) return

  const latestChange = changes[changes.length - 1]
  const changeText = latestChange.text
  const changeRange = latestChange.range
  const cursorPosition = changeRange.end

  // Check if the user has entered "${"
  const start = changeRange.start
  const range = new vscode.Range(start.translate(0, -1), start)
  const getPrevChar = document.getText(range)
  if (changeText === '{' && getPrevChar === '$') {
    await magic({ cursorPosition })
  } else if (changeText === '{}' && getPrevChar === '$') {
    await magic({ cursorPosition, isSingle: false })
  }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const disposable = vscode.workspace.onDidChangeTextDocument(
    onDidChangeTextDocument
  )
  context.subscriptions.push(disposable)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}

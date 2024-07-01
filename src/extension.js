const vscode = require('vscode')
const { Lexer } = require('./lib/ast/Lexer.js')
const { Parser } = require('./lib/ast/Parser.js')

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
  const content = document.getText()

  // Get the changes
  const changes = event.contentChanges
  if (changes.length === 0) return

  const latestChange = changes[changes.length - 1]
  const changeText = latestChange.text
  const changeRange = latestChange.range
  const cursorPosition = changeRange.end

  // Check if the user has entered "${"
  if (
    changeText === '{' &&
    document.getText(
      new vscode.Range(changeRange.start.translate(0, -1), changeRange.start)
    ) === '$'
  ) {
    // Lexer and Parser usage
    const lexer = new Lexer(content)
    const parser = new Parser(lexer)
    const ast = parser.parseProgram()

    // Check if the cursor is within a string literal that should be converted
    for (const node of ast.body) {
      if (node.type === 'StringLiteral') {
        const startGlobal = node.position.global.start
        const endGlobal = node.position.global.end
        const start = node.position.start.column
        const end = node.position.end.column
        const startRow = node.position.start.row

        // eslint-disable-next-line max-depth
        if (
          node.value.includes('${') &&
          cursorPosition.line + 1 === startRow &&
          cursorPosition.character + 1 >= start &&
          cursorPosition.character + 1 <= end
        ) {
          const edit = new vscode.WorkspaceEdit()

          // Replace the string literal with backticks
          const range = new vscode.Range(
            document.positionAt(startGlobal),
            document.positionAt(endGlobal + 1)
          )
          edit.replace(document.uri, range, '`' + node.value + '`')

          // Insert the closing "}"
          const insertPosition = cursorPosition.translate(0, 1)
          edit.insert(document.uri, insertPosition, '}')

          // Apply the edit
          await vscode.workspace.applyEdit(edit)

          // Move the cursor back to between "${}"
          const newPosition = cursorPosition.translate(0, 1)
          editor.selection = new vscode.Selection(newPosition, newPosition)
        }
      }
    }
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

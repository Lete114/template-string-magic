const vscode = require('vscode')
const { Lexer } = require('./lib/ast/Lexer.js')
const { Parser } = require('./lib/ast/Parser.js')

module.exports.magic = magic

/**
 *
 * @param { { cursorPosition: vscode.Position; isSingle?: boolean } } options
 * @returns
 */
// eslint-disable-next-line max-statements
async function magic(options) {
  const { cursorPosition, isSingle = true } = options
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return
  }

  const document = editor.document
  const content = document.getText()

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
        cursorPosition.character + 1 <= end &&
        isHtmlAttributeValue(content, startGlobal) === false
      ) {
        const edit = new vscode.WorkspaceEdit()

        // Replace the string literal with backticks
        const range = new vscode.Range(
          document.positionAt(startGlobal),
          document.positionAt(endGlobal + 1)
        )
        edit.replace(document.uri, range, '`' + node.value + '`')

        // Insert the closing "}"
        // eslint-disable-next-line max-depth
        if (isSingle) {
          const insertPosition = cursorPosition.translate(0, 1)
          edit.insert(document.uri, insertPosition, '}')
        }

        // Apply the edit
        await vscode.workspace.applyEdit(edit)

        // Move the cursor back to between "${}"
        const newPosition = cursorPosition.translate(0, 1)
        editor.selection = new vscode.Selection(newPosition, newPosition)
      }
    }
  }
}

/**
 *
 * @param {string} content
 * @param {number} startGlobal
 * @returns {boolean}
 */
// eslint-disable-next-line max-statements
function isHtmlAttributeValue(content, startGlobal) {
  // Check if the current character is a double quote or a single quote
  const quote = content[startGlobal]
  if (quote !== '"' && quote !== "'") {
    return false
  }

  // Check if the previous character is an equal sign
  if (content[startGlobal - 1] !== '=') {
    return false
  }

  // Check if the context is within an HTML tag
  let foundLessThan = false
  for (let i = startGlobal - 2; i >= 0; i--) {
    if (content[i] === '<') {
      foundLessThan = true
      break
    }
  }
  if (!foundLessThan) {
    return false
  }

  // Find the attribute name, which ends before the equal sign with a whitespace or a tag start symbol
  let attr = ''
  let i = startGlobal - 2
  while (i >= 0 && content[i] !== ' ' && content[i] !== '<') {
    attr = content[i] + attr
    i--
  }

  // Validate the attribute name with a regular expression
  const regex = /^[a-zA-Z_:][a-zA-Z0-9_:-]*$/
  return regex.test(attr.trim())
}

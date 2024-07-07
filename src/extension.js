const { toggleFileType } = require('./fileTypeManager')
const { onDidChangeTextDocument } = require('./magic')

/**
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

/**
 * @param {ExtensionContext} context
 */
function activate(context) {
  onDidChangeTextDocument(context)
  toggleFileType(context)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}

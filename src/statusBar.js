const vscode = require('vscode')

const FormatterStatus = {
  Success: 'check',
  Disabled: 'circle-slash'
}

class StatusBar {
  /** @type {vscode.StatusBarItem} */
  #statusBarItem = null

  /**
   *
   * @param {vscode.ExtensionContext} context
   */
  constructor(context) {
    // Setup the statusBarItem
    this.#statusBarItem = vscode.window.createStatusBarItem(
      'TemplateStringMagic.status',
      vscode.StatusBarAlignment.Right,
      -1
    )
    this.#statusBarItem.name = 'Template String Magic'
    this.#statusBarItem.text = 'Template String Magic'
    this.#statusBarItem.tooltip = 'Click to add or remove current file type'
    this.#statusBarItem.command = 'TemplateStringMagic.toggleFileType'
    this.#statusBarItem.show()

    // Add the statusBarItem to the subscriptions
    context.subscriptions.push(this.#statusBarItem)
  }

  /**
   *
   * @param { keyof FormatterStatus } StatusType
   */
  update(StatusType) {
    const status = FormatterStatus[StatusType]
    this.#statusBarItem.text = `$(${status}) Template String Magic`
    this.#statusBarItem.show()
  }

  hide() {
    this.#statusBarItem.hide()
  }
}

module.exports = { StatusBar }

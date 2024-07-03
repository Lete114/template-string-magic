module.exports.Lexer = class Lexer {
  constructor(input) {
    this.input = input
    this.position = { index: 0, line: 1, column: 0 }
    this.readPosition = { index: 0, line: 1, column: 0 }
    this.ch = ''
    this.readChar()
  }

  readChar() {
    if (this.readPosition.index >= this.input.length) {
      this.ch = null
    } else {
      this.ch = this.input[this.readPosition.index]
    }

    this.position = {
      index: this.readPosition.index,
      line: this.readPosition.line,
      column: this.readPosition.column
    }

    if (this.ch === '\n') {
      this.readPosition.line++
      this.readPosition.column = 0
    } else {
      this.readPosition.column++
    }

    this.readPosition.index++
  }

  nextToken() {
    this.skipWhitespace()
    let token

    if (this.ch === "'") {
      token = this.readString("'")
    } else if (this.ch === '"') {
      token = this.readString('"')
    } else if (this.ch === '`') {
      token = this.readString('`')
    } else if (this.ch === null) {
      token = { type: 'EOF', literal: '', position: this.position }
    } else {
      token = { type: 'ILLEGAL', literal: this.ch, position: this.position }
    }

    this.readChar()
    return token
  }

  skipWhitespace() {
    while (
      this.ch === ' ' ||
      this.ch === '\t' ||
      this.ch === '\n' ||
      this.ch === '\r'
    ) {
      this.readChar()
    }
  }

  // eslint-disable-next-line max-statements
  readString(quoteType) {
    const startPosition = { ...this.position }
    let globalStart = this.position.index
    let position = this.position.index + 1
    this.readChar() // Move past the opening quote

    while (this.ch !== quoteType && this.ch !== null) {
      this.readChar()
    }

    // get quote prev char
    const prevChat = this.input[this.readPosition.index - 2]
    if (prevChat === '\\') {
      this.readChar() // Move past the opening quote
      while (this.ch !== quoteType && this.ch !== null) {
        this.readChar()
      }
    }

    const literal = this.input.substring(position, this.position.index)
    const endPosition = { ...this.position }

    if (this.ch === quoteType) {
      return {
        type: 'STRING',
        literal,
        position: {
          global: { start: globalStart, end: this.position.index },
          start: startPosition,
          end: endPosition
        }
      }
    }
    return {
      type: 'ILLEGAL',
      literal: this.input.substring(position),
      position: {
        global: { start: globalStart, end: this.position.index },
        start: startPosition
      }
    }
  }
}

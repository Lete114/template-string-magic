module.exports.Parser = class Parser {
  constructor(lexer) {
    this.lexer = lexer
    this.currentToken = null
    this.nextToken()
  }

  nextToken() {
    this.currentToken = this.lexer.nextToken()
  }

  parseProgram() {
    const program = { type: 'Program', body: [] }

    while (this.currentToken.type !== 'EOF') {
      let statement = this.parseStatement()
      if (statement !== null) {
        program.body.push(statement)
      }
      this.nextToken()
    }

    return program
  }

  parseStatement() {
    switch (this.currentToken.type) {
      case 'STRING':
        return this.parseStringLiteral()
      default:
        return null
    }
  }

  parseStringLiteral() {
    const token = this.currentToken
    return {
      type: 'StringLiteral',
      value: token.literal,
      position: {
        global: {
          start: token.position.global.start,
          end: token.position.global.end
        },
        start: {
          row: token.position.start.line,
          column: token.position.start.column
        },
        end: {
          row: token.position.end.line,
          column: token.position.end.column
        }
      }
    }
  }
}

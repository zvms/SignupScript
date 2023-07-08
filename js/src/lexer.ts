export type Token = string | number;

export class Lexer {
  public rawTokens: string[] = [];
  protected get lastRawToken() {
    return this.rawTokens[this.rawTokens.length - 1] ?? "";
  }
  protected set lastRawToken(token: string) {
    this.rawTokens[this.rawTokens.length - 1] = token;
  }
  protected process(char: string) {
    if (char.trim().length === 0) {
      if (
        this.lastRawToken.trim().length === 0 &&
        this.lastRawToken !== "" /**not the first token */
      ) {
        this.lastRawToken = this.lastRawToken + char;
      } else {
        this.rawTokens.push(char);
      }
    } else if (char === "&" || char === "|") {
      if (this.lastRawToken === char) {
        this.lastRawToken = char + char;
      } else {
        this.rawTokens.push(char);
      }
    } else if (char === "=") {
      const last = this.rawTokens.at(-1);
      if (last === ">" || last === "<" || last === "=" || last === "!") {
        this.lastRawToken = last + char;
      } else {
        this.rawTokens.push(char);
      }
    } else if (
      char === "+" ||
      char === "-" ||
      char === "*" ||
      char === "/" ||
      char === "#" ||
      char === "!" ||
      char === ">" ||
      char === "<"
    ) {
      this.rawTokens.push(char);
    } else {
      if (/^[a-zA-Z0-9]+$/.test(this.lastRawToken)) {
        this.lastRawToken = this.lastRawToken + char;
      } else {
        this.rawTokens.push(char);
      }
    }
  }

  public run(source: string) {
    for (const c of source) {
      this.process(c);
    }
  }

  public get tokens(): Token[] {
    return this.rawTokens
      .filter((v) => v.trim().length > 0) // delete spaces
      .map((v) => (Number.isFinite(+v) ? +v : v)) // convert numeric to number type
      .map((v) => (v === "in" ? "&" : v)); // Alias
  }

  public static tokenlizeLine(line: string) {
    const lexer = new Lexer();
    lexer.run(line);
    return lexer.tokens;
  }
}

import { Lexer, type Token } from "./lexer.js";

export type TokenType =
  | "none"
  | "comment"
  | "statement-keyword"
  | "assignment-operator"
  | "operator"
  | "identifier"
  | "union-literal"
  | "numeric-literal"
  | "type-convertor"
  | "belong-to"
  | "error";

export function highlight(lines: string[]): string[] {
  return lines.map((line) => {
    try {
      return highlightStatement(line);
    } catch (e) {
      return `<span class="error">${line}  (${e})</span>`;
    }
  });
}

export function highlightStatement(line: string) {
  if (line.trim().length === 0) {
    return line;
  }
  if (line.trim()[0] === "#") {
    return `<span class="comment">${line}</span>`;
  }
  const lexer = new Lexer();
  lexer.run(line);
  const tokens = lexer.rawTokens;
  const comment = lexer.comment;

  let realTokenNum = 0;

  const tokenTypes: TokenType[] = tokens.map((token, idx): TokenType => {
    if (token.trim().length === 0) {
      return "none";
    }
    realTokenNum++;

    if (
      (realTokenNum === 1 && token === "must") ||
      token === "just" ||
      token === "return"
    ) {
      return "statement-keyword";
    }
    if (realTokenNum === 2 && token === "=") {
      return "assignment-operator";
    }
    if (
      token === "+" ||
      token === "-" ||
      token === "!" ||
      token === "&" ||
      token === "|" ||
      token === "==" ||
      token === ">" ||
      token === "<" ||
      token === ">=" ||
      token === "<=" ||
      token === "!=" ||
      token === "&&" ||
      token === "||" ||
      token === "in"
    ) {
      return "operator";
    }
    if (Number.isFinite(+token)) {
      const num = +token;
      if (0 <= num && num <= 2000) {
        return "numeric-literal";
      } else if (2000 < num && num <= 9999_99_99) {
        return "union-literal";
      }
    }
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
      return "identifier";
    }
    return "error";
  });

  return (
    tokens
      .map((token, idx) => {
        const tokenType = tokenTypes[idx];
        return tokenType === "none"
          ? token
          : `<span class="${tokenType}">${token}</span>`;
      })
      .join("") +
    (comment === null ? "" : `<span class="comment">#${comment}</span>`)
  );
}

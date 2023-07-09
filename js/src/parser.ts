import { Lexer, Token } from "./lexer.js";

export type ValueTypeNames = "int" | "boolean" | "union";

export type Statement =
  | BlankStatement
  | CommentStatement
  | MustStatement
  | JustStatement
  | ReturnStatement
  | AssignmentStatement;

interface BlankStatement {
  type: "blank";
}
interface CommentStatement {
  type: "comment";
  content: string;
}
interface MustStatement {
  type: "must";
  expr: ASTNode;
  comment: string | null;
}
interface JustStatement {
  type: "just";
  expr: ASTNode;
  comment: string | null;
}
interface ReturnStatement {
  type: "return";
  expr: ASTNode;
  comment: string | null;
}
interface AssignmentStatement {
  type: "assignment";
  id: string;
  expr: ASTNode;
  comment: string | null;
}

// export type NodeType =
//   | "union-to-int"
//   | "int-to-boolean"
//   | "&&"
//   | "||"
//   | "+"
//   | "-"
//   | "&"
//   | "|"
//   | "=="
//   | "!="
//   | ">"
//   | "<"
//   | ">="
//   | "<="
//   | "!"
//   | "id"
//   | "numeric-literal"
//   | "union-literal";

export type IdNode = { type: "id"; name: string };

export type BooleanNode = {
  valueType: "boolean";
} & (
  | { type: "&&" | "||"; left: BooleanNode; right: BooleanNode }
  | { type: "int-to-boolean"; from: IntNode }
  | { type: "!"; expr: BooleanNode }
  | {
      type: "==" | "!=" | ">" | "<" | ">=" | "<=";
      left: IntNode;
      right: IntNode;
    }
  | IdNode
);

export type IntNode = {
  valueType: "int";
} & (
  | { type: "+" | "-"; left: IntNode; right: IntNode }
  | { type: "union-to-int"; from: UnionNode }
  | { type: "numeric-literal"; value: number }
  | IdNode
);

export type UnionNode = {
  valueType: "union";
} & (
  | { type: "&" | "|"; left: UnionNode; right: UnionNode }
  | { type: "union-literal"; value: number }
  | IdNode
);

export type UnknownNode = {
  valueType: ValueTypeNames;
} & IdNode;

export type ASTNode = BooleanNode | IntNode | UnionNode | UnknownNode;

export class Parser {
  protected ctx = {
    before: "union",
    new: "union",
    after: "union",
  } as Record<string, ValueTypeNames>;

  protected wantInt(from: ASTNode): IntNode {
    if (from.valueType === "int") return from as IntNode;
    if (from.valueType === "union") {
      return {
        type: "union-to-int",
        from: from as UnionNode,
        valueType: "int",
      };
    }
    throw new Error(`不能将 ${from.valueType} 转换为整数。`);
  }
  protected wantBoolean(from: ASTNode): BooleanNode {
    if (from.valueType === "boolean") return from as BooleanNode;
    if (from.valueType === "int" || from.valueType === "union") {
      return {
        type: "int-to-boolean",
        from: this.wantInt(from),
        valueType: "boolean",
      };
    }
    throw new Error(`不能将 ${from.valueType} 转换为布尔类型`);
  }
  protected wantUnion(from: ASTNode): UnionNode {
    if (from.valueType === "union") return from as UnionNode;
    throw new Error(`不能将${from.valueType}转换为学生集合`);
  }

  public parseLine(line: string): Statement {
    line = line.trim();
    if (line === "") {
      return {
        type: "blank",
      };
    }
    if (line[0] === "#") {
      return {
        type: "comment",
        content: line.slice(1),
      };
    }
    const [tokens, comment] = Lexer.tokenlizeLine(line);
    if (
      typeof tokens[0] === "string" &&
      ["must", "just", "return"].includes(tokens[0])
    ) {
      return {
        type: tokens[0] as "must" | "just" | "return",
        expr: this.wantBoolean(this.parse1(tokens.slice(1))),
        comment,
      };
    }
    if (tokens[1] === "=") {
      const id = tokens[0];
      if (typeof id !== "string" || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id)) {
        throw new Error(`不合适的变量名: ${id}`);
      }
      const expr = this.parse1(tokens.slice(2));
      this.ctx[id] = expr.valueType;
      return {
        type: "assignment",
        id,
        expr,
        comment,
      };
    }
    throw new Error(`不能识别该语句`);
  }

  protected divide<const O extends string>(tokens: Token[], ops: O[]) {
    const i = tokens.findLastIndex(
      (v) => typeof v === "string" && ops.includes(v as O)
    );
    return i === -1
      ? ([null, null, null] as const)
      : ([tokens.slice(0, i), tokens[i] as O, tokens.slice(i + 1)] as const);
  }

  protected parse1(tokens: Token[]): ASTNode {
    const [l, o, r] = this.divide(tokens, ["&&", "||"]);
    if (l === null) {
      return this.parse2(tokens);
    } else {
      return {
        type: o,
        left: this.wantBoolean(this.parse1(l)),
        right: this.wantBoolean(this.parse2(r)),
        valueType: "boolean",
      };
    }
  }

  protected parse2(tokens: Token[]): ASTNode {
    if (tokens[0] === "!") {
      return {
        type: "!",
        expr: this.wantBoolean(this.parse3(tokens.slice(1))),
        valueType: "boolean",
      };
    }
    return this.parse3(tokens);
  }
  protected parse3(tokens: Token[]): ASTNode {
    const [l, o, r] = this.divide(tokens, ["==", "!=", ">", "<", ">=", "<="]);
    if (l === null) {
      return this.parse4(tokens);
    } else {
      let left = this.wantInt(this.parse4(l));
      const right = this.wantInt(this.parse4(r));
      return {
        type: o,
        left,
        right,
        valueType: "boolean",
      };
    }
  }

  protected parse4(tokens: Token[]): ASTNode {
    // Normalize tokens with unary operators
    const normalized = [];
    if (tokens[0] === "-") {
      normalized.push(0);
    }
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i] === "-" && tokens[i + 1] === "+") {
        normalized.push("-");
        i++;
        continue;
      }
      if (tokens[i] === "+" && tokens[i + 1] === "-") {
        normalized.push("-");
        i++;
        continue;
      }
      normalized.push(tokens[i]);
    }
    normalized.push(tokens[tokens.length - 1]);

    const [l, o, r] = this.divide(normalized, ["+", "-"]);
    if (l === null) {
      return this.parse5(tokens);
    }
    const left = this.wantInt(this.parse4(l));
    const right = this.wantInt(this.parse5(r));
    return {
      type: o,
      valueType: "int",
      left,
      right,
    };
  }

  protected parse5(tokens: Token[]): ASTNode {
    const [l, o, r] = this.divide(tokens, ["in"]);
    if (l === null) {
      return this.parse6(tokens);
    }
    const left = this.wantUnion(this.parse5(l));
    const right = this.wantUnion(this.parse6(r));
    return {
      type: "&",
      valueType: "union",
      left,
      right,
    };
  }

  protected parse6(tokens: Token[]): ASTNode {
    const [l, o, r] = this.divide(tokens, ["|", "&"]);
    if (l === null) {
      return this.parse7(tokens);
    }
    const left = this.wantUnion(this.parse6(l));
    const right = this.wantUnion(this.parse7(r));
    return {
      type: o,
      valueType: "union",
      left,
      right,
    };
  }

  protected parse7(tokens: Token[]): ASTNode {
    if (tokens.length !== 1) {
      throw new Error(`解析失败: ${formatTokens(tokens)}`);
    }
    const token = tokens[0];
    if (typeof token === "number") {
      if (token < 2000) {
        return {
          type: "numeric-literal",
          value: token,
          valueType: "int",
        };
      } else {
        return {
          type: "union-literal",
          value: token,
          valueType: "union",
        };
      }
    }
    if (!(token in this.ctx)) {
      throw new Error(`未定义的变量: ${token}`);
    }
    return {
      type: "id",
      name: token,
      valueType: this.ctx[token] ?? "err",
    };
  }

  public static parse(source: string): Statement[] {
    const parser = new Parser();
    const lines = source.split("\n");
    const ast = lines.map((line) => parser.parseLine(line));
    return ast;
  }
}

export function formatTokens(tokens: Token[]) {
  return tokens.map((v) => `"${v}"`).join(", ");
}

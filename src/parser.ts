import { Lexer, Token } from "./lexer.js";

export type ValueType = "int" | "boolean" | "union";

export type Statement =
  | CommentStatement
  | MustStatement
  | JustStatement
  | ReturnStatement
  | AssignmentStatement;

interface CommentStatement {
  type: "comment";
  content: string;
}
interface MustStatement {
  type: "must";
  expr: ASTNode;
}
interface JustStatement {
  type: "just";
  expr: ASTNode;
}
interface ReturnStatement {
  type: "return";
  expr: ASTNode;
}
interface AssignmentStatement {
  type: "assignment";
  id: string;
  expr: ASTNode;
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
  valueType: ValueType;
} & IdNode;

export type ASTNode = BooleanNode | IntNode | UnionNode | UnknownNode;

export class Parser {
  ctx = {
    before: "union",
    new: "union",
    after: "union",
  } as Record<string, ValueType>;

  wantInt(from: ASTNode): IntNode {
    if (from.valueType === "int") return from as IntNode;
    if (from.valueType === "union") {
      return {
        type: "union-to-int",
        from: from as UnionNode,
        valueType: "int",
      };
    }
    throw new Error(`Cannot convert ${from.valueType} to int`);
  }
  wantBoolean(from: ASTNode): BooleanNode {
    if (from.valueType === "boolean") return from as BooleanNode;
    if (from.valueType === "int" || from.valueType === "union") {
      return {
        type: "int-to-boolean",
        from: this.wantInt(from),
        valueType: "boolean",
      };
    }
    throw new Error(`Cannot convert ${from.valueType} to boolean`);
  }
  wantUnion(from: ASTNode): UnionNode {
    if (from.valueType === "union") return from as UnionNode;
    throw new Error(`Cannot convert ${from.valueType} to union`);
  }

  parseLine(line: string): Statement {
    line = line.trim();
    if (line === "") {
      return {
        type: "comment",
        content: "",
      };
    }
    if (line[0] === "#") {
      return {
        type: "comment",
        content: line.slice(1),
      };
    }
    const tokens = Lexer.tokenlizeLine(line);
    if (
      typeof tokens[0] === "string" &&
      ["must", "just", "return"].includes(tokens[0])
    ) {
      return {
        type: tokens[0] as "must" | "just" | "return",
        expr: this.wantBoolean(this.parse1(tokens.slice(1))),
      };
    }
    if (tokens[1] === "=") {
      const id = tokens[0];
      if (typeof id !== "string" || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id)) {
        throw new Error(`invalid identifier: ${id}`);
      }
      const expr = this.parse1(tokens.slice(2));
      this.ctx[id] = expr.valueType;
      return {
        type: "assignment",
        id,
        expr,
      };
    }
    throw new Error(`unknown statement at: "${line}", tokens: ${tokens}`);
  }

  divide<const O extends string>(tokens: Token[], ops: O[]) {
    const i = tokens.findLastIndex(
      (v) => typeof v === "string" && ops.includes(v as O)
    );
    return i === -1
      ? ([null, null, null] as const)
      : ([tokens.slice(0, i), tokens[i] as O, tokens.slice(i + 1)] as const);
    // for (const op of ops) {
    //   const i = tokens.lastIndexOf(op);
    //   if (i !== -1) {
    //     return [
    //       tokens.slice(0, i),
    //       op as O,
    //       tokens.slice(i + 1),
    //     ] as const;
    //   }
    // }
    // return [null, null, null] as const;
  }

  parse1(tokens: Token[]): ASTNode {
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

  parse2(tokens: Token[]): ASTNode {
    if (tokens[0] === "!") {
      return {
        type: "!",
        expr: this.wantBoolean(this.parse3(tokens.slice(1))),
        valueType: "boolean",
      };
    }
    return this.parse3(tokens);
  }
  parse3(tokens: Token[]): ASTNode {
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

  parse4(tokens: Token[]): ASTNode {
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

  parse5(tokens: Token[]): ASTNode {
    const [l, o, r] = this.divide(tokens, ["|", "&"]);
    if (l === null) {
      return this.parse6(tokens);
    }
    const left = this.wantUnion(this.parse5(l));
    const right = this.wantUnion(this.parse6(r));
    return {
      type: o,
      valueType: "union",
      left,
      right,
    };
  }

  parse6(tokens: Token[]): ASTNode {
    if (tokens.length !== 1) {
      throw new Error("error when parsing " + tokens.join(""));
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
      throw new Error(`unknown identifier: ${token}`);
    }
    return {
      type: "id",
      name: token,
      valueType: this.ctx[token] ?? "undefined",
    };
  }

  static parse(source: string) {
    const parser = new Parser();
    const lines = source.split("\n");
    const ast = lines.map((line) => parser.parseLine(line));
    return ast;
  }
}

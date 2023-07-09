import { TokenType } from "./highlight.js";
import { ASTNode, Parser, Statement } from "./parser.js";
import { Union } from "./student.js";

function span(type: TokenType, text: string) {
  return `<span class="${type}">${text}</span>`;
}

function comment(comment: string | null, nospace: boolean = false) {
  return comment === null
    ? ""
    : span("comment", `${nospace ? "" : " "}注释:${comment}`);
}

function format(type: TokenType) {
  return function ({ raw }: TemplateStringsArray, ...args: string[]) {
    return String.raw(
      {
        raw: raw.map((v) => span(type, v)),
      },
      ...args
    );
  };
}

const belongsToStr = format("belong-to")`属于`;
const isSthStr = format("belong-to")`是`;

export function explainStatement(statement: Statement) {
  switch (statement.type) {
    case "must":
      return (
        format("statement-keyword")`必须${explainExpr(
          statement.expr
        )}才可以报名` + comment(statement.comment)
      );
    case "just":
      return (
        format("statement-keyword")`只要${explainExpr(
          statement.expr
        )}就可以报名` + comment(statement.comment)
      );
    case "return":
      return (
        format("statement-keyword")`可否报名由${explainExpr(
          statement.expr
        )}决定` + comment(statement.comment)
      );
    case "assignment":
      return (
        format("statement-keyword")`将${span(
          "identifier",
          `“${statement.id}”`
        )}设置为${explainExpr(statement.expr)}` + comment(statement.comment)
      );
    case "comment":
      return comment(statement.content, true);
    case "blank":
      return "";
  }
}

export function explainExpr(node: ASTNode): string {
  switch (node.type) {
    case "union-literal":
      return explainUnion(Union.fromLiteral(node.value));
    case "numeric-literal":
      return span("numeric-literal", node.value.toString());
    case "|":
      return format("operator")`(要么${explainExpr(node.left)}要么${explainExpr(
        node.right
      )}的学生)`;
    case "&":
      return format("operator")`(既${explainExpr(node.left)}又${explainExpr(
        node.right
      )}的学生)`;
    case "id":
      switch (node.name) {
        case "before":
          return format("identifier")`${belongsToStr}已报名的学生`;
        case "new":
          return format("identifier")`${belongsToStr}想报名的学生`;
        case "after":
          return format(
            "identifier"
          )`${belongsToStr}该学生报名之后所有报名的学生`;
        default:
          return `${belongsToStr}${span("identifier", `“${node.name}”`)}`;
      }
    case "==":
      return format("operator")`(${explainExpr(node.left)}等于${explainExpr(
        node.right
      )})`;
    case "!=":
      return format("operator")`(${explainExpr(node.left)}不等于${explainExpr(
        node.right
      )})`;
    case ">":
      return format("operator")`(${explainExpr(node.left)}大于${explainExpr(
        node.right
      )})`;
    case ">=":
      return format("operator")`(${explainExpr(node.left)}大于等于${explainExpr(
        node.right
      )})`;
    case "<":
      return format("operator")`(${explainExpr(node.left)}小于${explainExpr(
        node.right
      )})`;
    case "<=":
      return format("operator")`(${explainExpr(node.left)}小于等于${explainExpr(
        node.right
      )})`;
    case "!":
      return format("operator")`(不满足${explainExpr(node.expr)})`;
    case "+":
      return format("operator")`(${explainExpr(node.left)}+${explainExpr(
        node.right
      )})`;
    case "-":
      return format("operator")`(${explainExpr(node.left)}-${explainExpr(
        node.right
      )})`;
    case "&&":
      return format("operator")`(${explainExpr(node.left)}且${explainExpr(
        node.right
      )})`;
    case "||":
      return format("operator")`(${explainExpr(node.left)}或${explainExpr(
        node.right
      )})`;
    case "union-to-int":
      return format("type-convertor")`${explainExpr(node.from)}的学生人数`;
    case "int-to-boolean":
      return format("type-convertor")`${explainExpr(node.from)}大于0`;
    default:
      const _: never = node;
      throw new Error(`Unknown node type: ${node["type"]}`);
  }
}

function explainUnion(value: Union): string {
  let prefix = belongsToStr;
  if (
    (value.students.size === 1 &&
      value.grades.size === 0 &&
      value.classes.size === 0) ||
    (value.students.size === 0 &&
      value.grades.size === 1 &&
      value.classes.size === 0) ||
    (value.students.size === 0 &&
      value.grades.size === 0 &&
      value.classes.size === 1)
  ) {
    prefix = isSthStr;
  }
  let result = [];
  const slashStr = span("belong-to", "/");
  const formatSet = (v: Set<number>) =>
    [...v].map((e) => span("union-literal", e.toString())).join(slashStr);
  if (value.students.size > 0) {
    result.push(formatSet(value.students));
  }
  if (value.grades.size > 0) {
    result.push(formatSet(value.grades));
  }
  if (value.classes.size > 0) {
    result.push(formatSet(value.classes));
  }
  return prefix + result.join(format("belong-to")`or`);
}

export interface StatementExplaination {
  type: "ok" | "error" | "tip";
  text: string;
}

export function explain(lines: string[]): StatementExplaination[] {
  const explainations: StatementExplaination[] = [];
  const parser = new Parser();
  for (const line of lines) {
    try {
      const statement = parser.parseLine(line);
      explainations.push({
        type: "ok",
        text: explainStatement(statement),
      });
    } catch (e) {
      explainations.push({
        type: "error",
        text: e + "",
      });
    }
  }

  return explainations;
}

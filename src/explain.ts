import { ASTNode, Statement } from "./parser.js";
import { Union } from "./student.js";

export function explainStatement(statement: Statement) {
  switch (statement.type) {
    case "must":
      return `必须${explainExpr(statement.expr)}才可以报名`;
    case "just":
      return `只要${explainExpr(statement.expr)}就可以报名`;
    case "return":
      return `返回${explainExpr(statement.expr)})`;
    case "assignment":
      return `“${statement.id}”是${explainExpr(statement.expr)}`;
    case "comment":
      return "";
  }
}

export function explainExpr(node: ASTNode): string {
  switch (node.type) {
    case "union-literal":
      return explainUnion(Union.fromLiteral(node.value));
    case "numeric-literal":
      return `${node.value}`;
    case "|":
      return `(要么${explainExpr(node.left)}要么${explainExpr(node.right)})`;
    case "&":
      return `(既${explainExpr(node.left)}又${explainExpr(node.right)})`;
    case "id":
      return `属于“${node.name}”`;
    case "==":
      return `(${explainExpr(node.left)}等于${explainExpr(node.right)})`;
    case "!=":
      return `(${explainExpr(node.left)}不等于${explainExpr(node.right)})`;
    case ">":
      return `(${explainExpr(node.left)}大于${explainExpr(node.right)})`;
    case ">=":
      return `(${explainExpr(node.left)}大于等于${explainExpr(node.right)})`;
    case "<":
      return `(${explainExpr(node.left)}小于${explainExpr(node.right)})`;
    case "<=":
      return `(${explainExpr(node.left)}小于等于${explainExpr(node.right)})`;
    case "!":
      return `(不满足${explainExpr(node.expr)})`;
    case "+":
      return `(${explainExpr(node.left)}+${explainExpr(node.right)})`;
    case "-":
      return `(${explainExpr(node.left)}-${explainExpr(node.right)})`;
    case "&&":
      return `(${explainExpr(node.left)}且${explainExpr(node.right)})`;
    case "||":
      return `(${explainExpr(node.left)}或${explainExpr(node.right)})`;
    case "union-to-int":
      return `${explainExpr(node.from)}的人数`;
    case "int-to-boolean":
      return `${explainExpr(node.from)}大于0`;
    default:
      const _: never = node;
      throw new Error(`Unknown node type: ${node["type"]}`);
  }
}

function explainUnion(value: Union): string {
  let prefix = "属于";
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
    prefix = "是";
  }
  let result = [];
  if (value.students.size > 0) {
    result.push([...value.students].join("/"));
  }
  if (value.grades.size > 0) {
    result.push([...value.grades].join("/"));
  }
  if (value.classes.size > 0) {
    result.push([...value.classes].join("/"));
  }
  return prefix + result.join("or");
}

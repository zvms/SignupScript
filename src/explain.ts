import type * as ast from "../ast.d.ts";
import {type MetaData } from "./index.js";

export function explain(node0:ast.ASTNode<any>): string {
  const node = node0 as ast.AllNodes;
  switch (node.type) {
    case "must":
        return `必须${explain(node.expr)}才可以报名`;
    case "just":
        return `只要${explain(node.expr)}就可以报名`;
    case "return":
        return `返回${explain(node.expr)}`;
    case "assignment":
        return `“${node.id}”是${explain(node.expr)}`;
    case "comment":
        return "";
    case "union-literal":
        return explainUnion(node.value);
    case "numeric-literal":
        return `${node.value}`;
    case "union":
        return `要么${explain(node.left)}要么${explain(node.right)}`;
    case "intersect":
        return `既${explain(node.left)}又${explain(node.right)}`;
    case "id":
        return `“${node.value}”`;
    case "eq":
        return `${explain(node.left)}等于${explain(node.right)}`;
    case "ne":
        return `${explain(node.left)}不等于${explain(node.right)}`;
    case "gt":
        return `${explain(node.left)}大于${explain(node.right)}`;
    case "ge":
        return `${explain(node.left)}大于等于${explain(node.right)}`;
    case "lt":
        return `${explain(node.left)}小于${explain(node.right)}`;
    case "le":
        return `${explain(node.left)}小于等于${explain(node.right)}`;
    case "not":
        return `不满足${explain(node.expr)}`;
    case "add":
        return `${explain(node.left)}+${explain(node.right)}`;
    case "sub":
        return `${explain(node.left)}-${explain(node.right)}`;
    case "and":
        return `${explain(node.left)}且${explain(node.right)}`;
    case "or":
        return `${explain(node.left)}或${explain(node.right)}`;
    case "union-to-int":
        return `${explain(node.from)}的人数`;
    case "int-to-boolean":
        return `${explain(node.from)}大于0`;
    case "program":
        throw new Error("Program node should not be explained");
    default:
        const _:never= node;
        throw new Error(`Unknown node type: ${node["type"]}`);
  }
}

function explainUnion(value: ast.UnionOfStundents): string {
    let result = [];
    if(value.individuals.length > 0) {
        result .push( value.individuals.join("、"))
    }
    if(value.grades.length > 0) {
        result.push(value.grades.join("、"))
    }
    if(value.classes.length > 0) {
        result.push(value.classes.join("、"))
    }
    return result.join("、");
}

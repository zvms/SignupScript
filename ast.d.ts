/**
 * It is not a must to make the value the simplist when parsing.
 */
interface UnionOfStundents {
  individuals: number[];
  classes: number[];
  grades: number[];
}

interface ASTNode<T> {
  type: string;
  eval(): T;
}
type VoidNode = ASTNode<void>;
type UnionNode = ASTNode<UnionOfStundents>;
type IntNode = ASTNode<number>;
type BooleanNode = ASTNode<boolean>;

type Context = Record<string, any>;

interface Program extends BooleanNode {
  type: "program";
  statements: Statement[];
}

type Statement =
  | CommentStatement
  | MustStatement
  | JustStatement
  | ReturnStatement
  | AssignmentStatement;

interface CommentStatement extends VoidNode {
  type: "comment";
  content: string;
}
interface MustStatement extends VoidNode {
  type: "must";
  expr: BooleanNode;
}
interface JustStatement extends VoidNode {
  type: "just";
  expr: BooleanNode;
}
interface ReturnStatement extends VoidNode {
  type: "return";
  expr: BooleanNode;
}
interface AssignmentStatement extends VoidNode {
  type: "assignment";
  id: string;
  expr: ASTNode<any>;
}

interface UnionLiteral extends UnionNode {
  type: "union-literal";
  value: UnionOfStundents;
}
interface NumericLiteral extends IntNode {
  type: "numeric-literal";
  value: number;
}
interface Id<Ctx extends Context, Id extends keyof Ctx>
  extends ASTNode<Ctx[Id]> {
  type: "id";
  name: string;
}

interface UnionKindExpr<N extends string> extends UnionNode {
  type: N;
  left: UnionNode;
  right: UnionNode;
}
type UnionExpr = UnionKindExpr<"&">;
type IntersectExpr = UnionKindExpr<"|">;

interface AlgebraKindExpr<N extends string> extends IntNode {
  type: N;
  left: IntNode;
  right: IntNode;
}
type AddExpr = AlgebraKindExpr<"+">;
type SubExpr = AlgebraKindExpr<"-">;

interface ComparisonKindExpr<N extends string> extends BooleanNode {
  type: N;
  left: IntNode;
  right: IntNode;
}
type EqExpr = ComparisonKindExpr<"==">;
type NeExpr = ComparisonKindExpr<"!=">;
type GtExpr = ComparisonKindExpr<">">;
type GeExpr = ComparisonKindExpr<">=">;
type LtExpr = ComparisonKindExpr<"<">;
type LeExpr = ComparisonKindExpr<"<=">;

interface NotExpr extends BooleanNode {
  type: "!";
  expr: BooleanNode;
}

interface LogicalKindExpr<N extends string> extends BooleanNode {
  type: N;
  left: BooleanNode;
  right: BooleanNode;
}
type AndExpr = LogicalKindExpr<"&&">;
type OrExpr = LogicalKindExpr<"||">;

type ConverionKindExpr<
  N extends string,
  F extends ASTNode<any>,
  T extends ASTNode<any>
> = T & {
  type: N;
  from: F;
};
type UnionToIntExpr = ConverionKindExpr<"union-to-int", UnionNode, IntNode>;
type IntToBooleanExpr = ConverionKindExpr<
  "int-to-boolean",
  IntNode,
  BooleanNode
>;

type AllNodes =
  | Program
  | Statement
  | UnionLiteral
  | NumericLiteral
  | Id<any,any>
  | UnionExpr
  | IntersectExpr
  | AddExpr
  | SubExpr
  | EqExpr
  | NeExpr
  | GtExpr
  | GeExpr
  | LtExpr
  | LeExpr
  | NotExpr
  | AndExpr
  | OrExpr
  | UnionToIntExpr
  | IntToBooleanExpr;
export {
  AllNodes,
  Program,
  Statement,
  MustStatement,
  JustStatement,
  ReturnStatement,
  AssignmentStatement,
  UnionLiteral,
  NumericLiteral,
  Id,
  UnionExpr,
  IntersectExpr,
  AddExpr,
  SubExpr,
  EqExpr,
  NeExpr,
  GtExpr,
  GeExpr,
  LtExpr,
  LeExpr,
  NotExpr,
  AndExpr,
  OrExpr,
  UnionToIntExpr,
  IntToBooleanExpr,
  Context,
  UnionOfStundents,
  VoidNode,
  UnionNode,
  IntNode,
  BooleanNode,
  ASTNode,
};

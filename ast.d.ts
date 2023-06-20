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
  value: string;
}

interface UnionKindExpr<N extends string> extends UnionNode {
  type: N;
  left: UnionNode;
  right: UnionNode;
}
type UnionExpr = UnionKindExpr<"union">;
type IntersectExpr = UnionKindExpr<"intersect">;

interface AlgebraKindExpr<N extends string> extends IntNode {
  type: N;
  left: IntNode;
  right: IntNode;
}
type AddExpr = AlgebraKindExpr<"add">;
type SubExpr = AlgebraKindExpr<"sub">;

interface ComparisonKindExpr<N extends string> extends BooleanNode {
  type: N;
  left: IntNode;
  right: IntNode;
}
type EqExpr = ComparisonKindExpr<"eq">;
type NeExpr = ComparisonKindExpr<"ne">;
type GtExpr = ComparisonKindExpr<"gt">;
type GeExpr = ComparisonKindExpr<"ge">;
type LtExpr = ComparisonKindExpr<"lt">;
type LeExpr = ComparisonKindExpr<"le">;

interface NotExpr extends BooleanNode {
  type: "not";
  expr: BooleanNode;
}

interface LogicalKindExpr<N extends string> extends BooleanNode {
  type: N;
  left: BooleanNode;
  right: BooleanNode;
}
type AndExpr = LogicalKindExpr<"and">;
type OrExpr = LogicalKindExpr<"or">;

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

import { type ASTNode, type Statement } from "./parser.js";
import { Student, Union } from "./student.js";

class ExecReturn {
  constructor(public retVal: boolean) {}
}
export type ValueType = Union | Student | boolean | number;

export class VM {
  ctx: Record<string, ValueType> = {};

  public execute(stmt: Statement): void {
    function returns(val: boolean): never {
      throw new ExecReturn(val);
    }
    switch (stmt.type) {
      case "comment":
        return;
      case "must":
        if (!this.eval(stmt.expr)) {
          returns(false);
        }
        return;
      case "just":
        if (this.eval(stmt.expr)) {
          returns(true);
        }
        return;
      case "return":
        const result = this.eval(stmt.expr);
        if (typeof result === "boolean") {
          returns(result);
        } else {
          throw new Error("return value must be boolean");
        }
      case "assignment":
        this.ctx[stmt.id] = this.eval(stmt.expr);
        return;
    }
  }

  public eval(node: ASTNode): ValueType {
    switch (node.type) {
      case "union-to-int":
        return (this.eval(node.from) as Union).length;
      case "int-to-boolean":
        return (this.eval(node.from) as number) > 0;
      case "&&":
        return this.eval(node.left) && this.eval(node.right);
      case "||":
        return this.eval(node.left) || this.eval(node.right);
      case "+":
        return (
          (this.eval(node.left) as number) + (this.eval(node.right) as number)
        );
      case "-":
        return (
          (this.eval(node.left) as number) - (this.eval(node.right) as number)
        );
      case "&":
        return Union.intersect(
          this.eval(node.left) as Union,
          this.eval(node.right) as Union
        );
      case "|":
        return Union.union(
          this.eval(node.left) as Union,
          this.eval(node.right) as Union
        );
      case "==":
        return this.eval(node.left) === this.eval(node.right);
      case "!=":
        return this.eval(node.left) !== this.eval(node.right);
      case ">":
        return (
          (this.eval(node.left) as number) > (this.eval(node.right) as number)
        );
      case "<":
        return (
          (this.eval(node.left) as number) < (this.eval(node.right) as number)
        );
      case ">=":
        return (
          (this.eval(node.left) as number) >= (this.eval(node.right) as number)
        );
      case "<=":
        return (
          (this.eval(node.left) as number) <= (this.eval(node.right) as number)
        );
      case "!":
        return !(this.eval(node.expr) as boolean);
      case "id":
        if (!(node.name in this.ctx))
          throw new Error(`unknown variable: ${node.name}`);
        return this.ctx[node.name];
      case "numeric-literal":
        return node.value;
      case "union-literal":
        return Union.fromLiteral(node.value);
      default:
        throw new Error(`unknown node type: ${(node as ASTNode).type}`);
    }
  }

  public static run(program: Statement[], before: Union, neo: Student) {
    const after = Union.addStudent(before, neo);
    const vm = new VM();
    vm.ctx = {
      before,
      new: new Union(new Set(), new Set(), new Set([neo])),
      after,
    };
    try {
      for (const line of program) {
        vm.execute(line);
      }
    } catch (e) {
      if (e instanceof ExecReturn) {
        return e.retVal;
      } else {
        throw e;
      }
    }
    return true;
  }

  public static check(program: Statement[], students: Student[]): boolean {
    const before = new Union(new Set(), new Set(), new Set());
    for (const student of students) {
      if (!VM.run(program, before, student)) {
        return false;
      }
      before.students.add(student);
    }
    return true;
  }
}

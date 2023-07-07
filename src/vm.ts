import { type ASTNode, type Statement } from "./parser.js";
import { Student, Union } from "./student.js";

class ExecReturn {
  constructor(public retVal: boolean) {}
}
export type ValueType = Union | Student | boolean | number;

export class VM {
  ctx: Record<string, ValueType> = {};

  execute(node: Statement): void {
    function returns(val: boolean): never {
      throw new ExecReturn(val);
    }
    switch (node.type) {
      case "comment":
        return;
      case "must":
        if (!this.eval(node.expr)) {
          returns(false);
        }
      case "just":
        if (this.eval(node.expr)) {
          returns(true);
        }
      case "return":
        returns(this.eval(node.expr));
      case "assignment":
        this.ctx[node.id] = this.eval(node.expr);
    }
  }

  eval(node: ASTNode): ValueType {
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
        return (this.eval(node.left) as number) + (this.eval(node.right) as number);
      case "-":
        return  (this.eval(node.left) as number) - (this.eval(node.right) as number);
      case "&":
        return 
      case "|":
      case "==":
      case "!=":
      case ">":
      case "<":
      case ">=":
      case "<=":
      case "!":
      case "id":
      case "numeric-literal":
      case "union-literal":
    }
  }

  static run(program: ASTNode[], before: Union, neo: Student) {
    const after = Union.add(before, neo);
    const vm = new VM();
    vm.ctx = {
      before,
      neo,
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
}

from typing import Dict, List, Union

from student import Student, Union as StudentUnion


class ExecReturn(Exception):
    def __init__(self, retVal: bool):
        self.retVal = retVal


class VM:
    def __init__(self):
        self.ctx: Dict[str, Union[Student, StudentUnion, bool, int]] = {}

    def execute(self, node) -> None:
        def returns(val: bool) -> None:
            raise ExecReturn(val)
        t = node["type"]
        match t:
            case "comment":
                return
            case "must":
                if not self.eval(node["expr"]):
                    returns(False)
            case "just":
                if self.eval(node["expr"]):
                    returns(True)
            case "return":
                result = self.eval(node["expr"])
                if isinstance(result, bool):
                    returns(result)
                else:
                    raise Exception("return value must be boolean")
            case "assignment":
                id_ = node.id
                expr = self.eval(node["expr"])
                self.ctx[id_] = expr
            case "if":
                if self.eval(node.cond):
                    for stmt in node.body:
                        self.execute(stmt)
                elif node.elseBody is not None:
                    for stmt in node.elseBody:
                        self.execute(stmt)
            case "while":
                while self.eval(node.cond):
                    for stmt in node.body:
                        self.execute(stmt)
            case _:
                raise Exception(f"unknown statement type: {t}")

    def eval(self, node) -> Union[Student, StudentUnion, bool, int]:

        t = node["type"]

        match t:
            case "id":
                name = node["name"]
                if name not in self.ctx:
                    raise Exception(f"unknown identifier: {name}")
                return self.ctx[name]
            case "union-to-int":
                return self.eval(node["from"]).length
            case "int-to-boolean":
                return self.eval(node["from"]) > 0
            case "numeric-literal":
                return node["value"]
            case "union-literal":
                return StudentUnion.fromLiteral(node["value"])
            case "!":
                return not self.eval(node["expr"])
            case "&&":
                return self.eval(node["left"]) and self.eval(node["right"])
            case "||":
                return self.eval(node["left"]) or self.eval(node["right"])
            case "==" | "!=" | ">" | "<" | ">=" | "<=" | "+" | "-":
                left = self.eval(node["left"])
                right = self.eval(node["right"])
                if isinstance(left, int) and isinstance(right, int):
                    match t:
                        case "==":
                            return left == right
                        case "!=":
                            return left != right
                        case ">":
                            return left > right
                        case "<":
                            return left < right
                        case ">=":
                            return left >= right
                        case "<=":
                            return left <= right
                else:
                    raise Exception(
                        f"invalid operands for {t}: {left}, {right}")
            case "|" | "&":
                left = self.eval(node["left"])
                right = self.eval(node["right"])
                if isinstance(left, StudentUnion) and isinstance(right, StudentUnion):
                    if t == "|":
                        return StudentUnion.union(left, right)
                    else:
                        return StudentUnion.intersect(left, right)
                else:
                    raise Exception(
                        f"invalid operands for {t}: {left}, {right}")
            case _:
                raise Exception(f"unknown expression type: {t}")

    @staticmethod
    def run(program: List, before: StudentUnion, neo: Student):
        after = StudentUnion.addStudent(before, neo)
        vm = VM()
        vm.ctx = {
            "before": before,
            "new": StudentUnion(set(), set(), set([neo])),
            "after": after
        }
        try:
            for line in program:
                vm.execute(line)
        except ExecReturn as e:
            return e.retVal
        return True

    @staticmethod
    def check(program: List, students: List) -> bool:
        before = StudentUnion(set(), set(), set())
        for student in students:
            if not VM.run(program, before, student):
                return False
            before.students.add(student)
        return True

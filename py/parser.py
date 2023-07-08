import json
from lexer import Lexer

# Identifier regex
import re
id_reg = re.compile(r"^[a-zA-Z_][a-zA-Z0-9_]*$")


class Parser:
    def __init__(self):
        self.ctx = {
            "before": "union",
            "new": "union",
            "after": "union"
        }

    def wantInt(self, from_):
        if from_["valueType"] == "int":
            return from_
        if from_["valueType"] == "union":
            return {
                "type": "union-to-int",
                "from": from_,
                "valueType": "int"
            }
        raise Exception(f"Cannot convert {from_['valueType']} to int")

    def wantBoolean(self, from_):
        if from_["valueType"] == "boolean":
            return from_
        if from_["valueType"] == "int" or from_["valueType"] == "union":
            return {
                "type": "int-to-boolean",
                "from": self.wantInt(from_),
                "valueType": "boolean"
            }
        raise Exception(f"Cannot convert {from_['valueType']} to boolean")

    def wantUnion(self, from_):
        if from_["valueType"] == "union":
            return from_
        raise Exception(f"Cannot convert {from_['valueType']} to union")

    def parseLine(self, line):
        line = line.strip()
        if line == "":
            return {
                "type": "comment",
                "content": ""
            }
        if line[0] == "#":
            return {
                "type": "comment",
                "content": line[1:]
            }
        tokens = Lexer.tokenlize_line(line)
        if isinstance(tokens[0], str) and tokens[0] in ["must", "just", "return"]:
            return {
                "type": tokens[0],
                "expr": self.wantBoolean(self.parse1(tokens[1:])),
            }
        if tokens[1] == "=":
            id_ = tokens[0]
            if not isinstance(id_, str) or id_reg.match(id_) is None:
                raise Exception(f"invalid identifier: {id_}")
            expr = self.parse1(tokens[2:])
            self.ctx[id_] = expr["valueType"]
            return {
                "type": "assignment",
                "id": id_,
                "expr": expr
            }
        raise Exception(f"unknown statement at: \"{line}\", tokens: {tokens}")

    def divide(self, tokens, ops):
        i = len(tokens) - 1
        while i >= 0:
            if isinstance(tokens[i], str) and tokens[i] in ops:
                return [tokens[:i], tokens[i], tokens[i+1:]]
            i -= 1
        return [None, None, None]

    def parse1(self, tokens):
        l, o, r = self.divide(tokens, ["&&", "||"])
        if l is None:
            return self.parse2(tokens)
        else:
            return {
                "type": o,
                "left": self.wantBoolean(self.parse1(l)),
                "right": self.wantBoolean(self.parse2(r)),
                "valueType": "boolean"
            }

    def parse2(self, tokens):
        if tokens[0] == "!":
            return {
                "type": "!",
                "expr": self.wantBoolean(self.parse3(tokens[1:])),
                "valueType": "boolean"
            }
        return self.parse3(tokens)

    def parse3(self, tokens):
        l, o, r = self.divide(tokens, ["==", "!=", ">", "<", ">=", "<="])
        if l is None:
            return self.parse4(tokens)
        else:
            left = self.wantInt(self.parse4(l))
            right = self.wantInt(self.parse4(r))
            return {
                "type": o,
                "left": left,
                "right": right,
                "valueType": "boolean"
            }

    def parse4(self, tokens):
        # Normalize tokens with unary operators
        normalized = []
        if tokens[0] == "-":
            normalized.append(0)
        i = 0
        while i < len(tokens) - 1:
            if tokens[i] == "-" and tokens[i + 1] == "+":
                normalized.append("-")
                i += 1
            elif tokens[i] == "+" and tokens[i + 1] == "-":
                normalized.append("-")
                i += 1
            else:
                normalized.append(tokens[i])
            i += 1
        normalized.append(tokens[-1])
        l, o, r = self.divide(normalized, ["+", "-"])
        if l is None:
            return self.parse5(tokens)
        left = self.wantInt(self.parse4(l))
        right = self.wantInt(self.parse5(r))
        return {
            "type": o,
            "valueType": "int",
            "left": left,
            "right": right
        }

    def parse5(self, tokens):
        l, o, r = self.divide(tokens, ["|", "&"])
        if l is None:
            return self.parse6(tokens)
        left = self.wantUnion(self.parse5(l))
        right = self.wantUnion(self.parse6(r))
        return {
            "type": o,
            "valueType": "union",
            "left": left,
            "right": right
        }

    def parse6(self, tokens):
        if len(tokens) != 1:
            raise Exception(f"error when parsing {json.dumps(tokens)}")
        token = tokens[0]
        if isinstance(token, int):
            if token < 2000:
                return {
                    "type": "numeric-literal",
                    "value": token,
                    "valueType": "int"
                }
            else:
                return {
                    "type": "union-literal",
                    "value": token,
                    "valueType": "union"
                }
        if token not in self.ctx:
            raise Exception(f"unknown identifier: {token}")
        return {
            "type": "id",
            "name": token,
            "valueType": self.ctx.get(token, "undefined")
        }

    @staticmethod
    def parse(source):
        parser = Parser()
        lines = source.split("\n")
        ast = [parser.parseLine(line) for line in lines]
        return ast

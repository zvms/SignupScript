from typing import List, Union

Token = Union[str, int]


class Lexer:
    def __init__(self, source: str):
        self.source = source
        self.rawTokens = []

    @property
    def lastRawToken(self):
        return self.rawTokens[-1] if self.rawTokens else ""

    @lastRawToken.setter
    def lastRawToken(self, token: str):
        if self.rawTokens:
            self.rawTokens[-1] = token

    def process(self, char: str):
        if char == "&" or char == "|":
            if self.lastRawToken == char:
                self.lastRawToken = char + char
            else:
                self.rawTokens.append(char)
        elif char == " " or char == "\t":
            if self.lastRawToken != " ":
                self.rawTokens.append(" ")
        elif char == "=":
            last = self.lastRawToken
            if last == ">" or last == "<" or last == "=" or last == "!":
                self.lastRawToken = last + char
            else:
                self.rawTokens.append(char)
        elif (
            char == "+" or
            char == "-" or
            char == "*" or
            char == "/" or
            char == "#" or
            char == "!" or
            char == ">" or
            char == "<"
        ):
            self.rawTokens.append(char)
        else:
            if self.lastRawToken.isalnum():
                self.lastRawToken = self.lastRawToken + char
            else:
                self.rawTokens.append(char)

    def run(self, source: str):
        for c in source:
            self.process(c)

    @property
    def tokens(self) -> List[Token]:
        return [
            int(v) if str(v).isdigit() else v for v in map(lambda v:'&' if v == 'in' else v, self.rawTokens) if v != " "
        ]

    @staticmethod
    def tokenlize_line(line: str) -> List[Token]:
        lexer = Lexer(line)
        lexer.run(line)
        return lexer.tokens

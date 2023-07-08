import json

from parser import Parser
from student import Union
from vm import VM

metadata = {
    "grades": [
        {
            "name": "高一",
            "id": 2022,
            "classes": [
                {
                    "name": "高一1班",
                    "id": 202201,
                    "students": [20220101, 20220102, 20220103],
                },
                {
                    "name": "高一2班",
                    "id": 202202,
                    "students": [20220201, 20220202, 20220203],
                },
                {
                    "name": "高一3班",
                    "id": 202203,
                    "students": [20220301, 20220302, 20220303, 20220304],
                },
            ],
        },
    ],
    "current": [20220101, 20220203, 20220303],
    "neo": 20220304,
}

with open("../../example.signup", "r") as file:
    source = file.read()

program = Parser.parse(source)

print(program)

with open("../../example.ast.json", "w") as file:
    json.dump(program, file, indent=2)

result = VM.run(
    program,
    Union({20220101, 20220203, 20220303}, set(), set()),
    20220304
)

print(result)

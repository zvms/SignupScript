import { explainStatement } from "./explain.js";
import { Parser } from "./parser.js";
import { Union } from "./student.js";
import { VM } from "./vm.js";

import fs from "node:fs";

const metadata = {
  grades: [
    {
      name: "高一",
      id: 2022,
      classes: [
        {
          name: "高一1班",
          id: 202201,
          students: [20220101, 20220102, 20220103],
        },
        {
          name: "高一2班",
          id: 202202,
          students: [20220201, 20220202, 20220203],
        },
        {
          name: "高一3班",
          id: 202203,
          students: [20220301, 20220302, 20220303, 20220304],
        },
      ],
    },
  ],
  current: [20220101, 20220203, 20220303],
  neo: 20220304,
};

const source = fs.readFileSync("../../example.signup", "utf-8");

const program = Parser.parse(source);

console.log(program);

fs.writeFileSync("../../example.ast.json", JSON.stringify(program, null, 2));

const explaination = program.map((statement) => explainStatement(statement));

console.log(explaination);

fs.writeFileSync("../../example.explaination.txt", explaination.join("\n"));

const result = VM.run(program, [20220101, 20220203, 20220303], 20220304);

console.log(result);

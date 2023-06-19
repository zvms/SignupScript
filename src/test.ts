import { type MetaData, run } from "./index.js";
import fs from "node:fs";

const metadata: MetaData = {
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

const source = fs.readFileSync("../src/test.signup", "utf-8");

console.log(run(source, metadata));

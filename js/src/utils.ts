import { Parser, type Program } from "./parser.js";

export function isValid(source: string): Program | false {
  try {
    return Parser.parse(source);
  } catch (e) {
    return false;
  }
}

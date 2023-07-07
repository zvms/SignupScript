export interface Class {
  id: number;
  name: string;
  students: number[];
}
export interface Grade {
  id: number;
  name: string;
  classes: Class[];
}
export interface MetaData {
  grades: Grade[];
  current: number[];
  neo: number;
}

type Token = string | number;

export function tokenlizer(source: string): Token[] {
  source = source.trim();
  if (source.length === 0 || source[0] === "#") {
    return [];
  }
  function getType(char: string, next: string) {
    if (char === " " || char === "=") return char;
    if (/\d/.test(char)) return "number";
    const s = char + next;
    if (s === "&&" || s === "||") return s;
    if (char === "&" || char === "|") return char;
    return "identifier";
  }
  let tokens: Token[] = [];
  let current = "";
  let last = null;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1] ?? "";
    const type = getType(char, next);
    if (type === last) {
      current += char;
    } else {
      if (current.trim() !== "") {
        if (last === "number") {
          tokens.push(parseInt(current));
        } else {
          tokens.push(current);
        }
      }
      current = char;
      last = type;
    }
  }
  tokens.push(last === "number" ? parseInt(current) : current);
  return tokens;
}

type Context = Record<string, number | boolean | number[]>;

export function run(source: string, metadata: MetaData): boolean {
  let ctx: Context = {
    current: metadata.current,
    new: metadata.neo,
  };

  for (const statement of source.split("\n")) {
    const tokens = tokenlizer(statement);
    if (tokens.length === 0) {
      continue;
    }
    if (tokens[0] === "must") {
      // must statement
      if (!eval5(ctx, tokens.slice(1), metadata)) {
        return false;
      }
    } else if (tokens[0] === "just") {
      // just statement
      if (eval5(ctx, tokens.slice(1), metadata)) {
        return true;
      }
    } else if (tokens[1] === "=") {
      // assignment statement
      ctx[tokens[0]] = eval5(ctx, tokens.slice(2), metadata);
    } else {
      // error
      throw new Error("invalid statement");
    }
  }
  return true;
}

function eval5(ctx: Context, tokens: Token[], metadata: MetaData): boolean {
  const i = tokens.findIndex((t) => t === "&&" || t === "||");
  if (i === -1) {
    return eval4(ctx, tokens, metadata);
  }
  const left = eval4(ctx, tokens.slice(0, i), metadata);
  const right = eval5(ctx, tokens.slice(i + 1), metadata);
  if (tokens[i] === "&&") {
    return left && right;
  } else {
    return left || right;
  }
}

function eval4(ctx: Context, tokens: Token[], metadata: MetaData): boolean {
  const i = tokens.findIndex(
    (t) =>
      t === "==" ||
      t === "!=" ||
      t === "<" ||
      t === ">" ||
      t === "<=" ||
      t === ">="
  );
  if (i === -1) {
    const v = eval3(ctx, tokens, metadata);
    if (typeof v === "number") {
      return v > 0;
    }
    return v;
  }
  const left = eval3(ctx, tokens.slice(0, i), metadata);
  const right = eval3(ctx, tokens.slice(i + 1), metadata);
  if (typeof left === "boolean" || typeof right === "boolean") {
    throw new Error("invalid operation");
  }
  switch (tokens[i]) {
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case "<":
      return left < right;
    case ">":
      return left > right;
    case "<=":
      return left <= right;
    case ">=":
      return left >= right;
    default:
      throw new Error("invalid operator: " + tokens[i]);
  }
}

function eval3(
  ctx: Context,
  tokens: Token[],
  metadata: MetaData
): boolean | number {
  const i = tokens.findIndex((t) => t === "+" || t === "-");
  if (i === -1) {
    const v = eval2(ctx, tokens, metadata);
    if (typeof v === "boolean" || typeof v === "number") {
      return v;
    }
    return v.length;
  }
  let left = eval2(ctx, tokens.slice(0, i), metadata);
  if (typeof left === "boolean") {
    throw new Error("invalid operation");
  } else if (Array.isArray(left)) {
    left = left.length;
  }
  let right = eval2(ctx, tokens.slice(i + 1), metadata);
  if (typeof right === "boolean") {
    throw new Error("invalid operation");
  } else if (Array.isArray(right)) {
    right = right.length;
  }
  if (tokens[i] === "+") {
    return left + right;
  } else {
    return left - right;
  }
}

function eval2(
  ctx: Context,
  tokens: Token[],
  metadata: MetaData
): number[] | boolean | number {
  const i = tokens.findIndex((t) => t === "in");
  if (i === -1) {
    return eval0(ctx, tokens, metadata);
  }
  const left = eval0(ctx, tokens.slice(0, i), metadata);
  if (!Array.isArray(left)) {
    throw new Error("invalid operation");
  }
  const right = eval1(ctx, tokens.slice(i + 1), metadata);
  if (!Array.isArray(right)) {
    throw new Error("invalid operation");
  }
  if (left.length === 1) {
    return has(right, left[0]);
  }
  return left.filter((v) => has(right, v));
}

function eval1(ctx: Context, tokens: Token[], metadata: MetaData): number[] {
  const i = tokens.findIndex((t) => t === "|" || t === "&");
  if (i === -1) {
    return eval0(ctx, tokens, metadata) as number[];
  }
  const left = eval0(ctx, tokens.slice(0, i), metadata);
  if (!Array.isArray(left)) {
    throw new Error("invalid operation");
  }
  const right = eval1(ctx, tokens.slice(i + 1), metadata);
  switch (tokens[i]) {
    case "|":
      return left.concat(right);
    case "&":
      return left.filter((v) => has(right, v));
  }
  throw new Error("invalid operator: " + tokens[i]);
}

function eval0(
  ctx: Context,
  tokens: Token[],
  metadata: MetaData
): number[] | number | boolean {
  if (tokens.length !== 1) {
    throw new Error("invalid expression");
  }
  const token = tokens[0];
  if (typeof token === "number") {
    if (token < 2000) {
      return token;
    }
    return parseID(metadata, token).members;
  }
  const v = ctx[token];
  if (typeof v === "number") {
    if (v < 2000) {
      return v;
    }
    return parseID(metadata, v).members;
  }
  if (Array.isArray(v)) {
    return v;
  }
  if (typeof v === "boolean") {
    return v;
  }
  throw new Error("invalid expression");
}

function isGradeID(metadata: MetaData, value: number): boolean {
  const t = value > 2000 && value < 10000;
  return t;
}

function isClassID(metadata: MetaData, value: number): [boolean, number] {
  const t = value > 200000 && value < 1000000;
  const g = metadata.grades.findIndex((v) => v.id === Math.floor(value / 100));
  return [t, g];
}

function isStudentID(
  metadata: MetaData,
  value: number
): [boolean, number, number] {
  const t = value > 20000000 && value < 100000000;
  const g = metadata.grades.findIndex((v) => v.id === Math.floor(value / 10000));
  const c = metadata.grades[g].classes.findIndex(
    (v) => v.id === Math.floor(value / 100)
  );
  return [t, g, c];
}

function has(union: number[], value: number): boolean {
  return union.some((v) => v === value);
}

function parseID(
  metadata: MetaData,
  id: number
): {
  desc: string;
  members: number[];
} {
  if (isGradeID(metadata, id)) {
    const grade = metadata.grades.find((v) => v.id === id);
    if (!grade) {
      throw new Error("invalid grade id");
    }
    return {
      desc: grade.name,
      members: grade.classes.map((v) => v.id),
    };
  }
  const [isClass, g] = isClassID(metadata, id);
  if (isClass) {
    const grade = metadata.grades[g];
    const cls = grade.classes.find((v) => v.id === id);
    if (!cls) {
      throw new Error("invalid class id");
    }
    return {
      desc: cls.name,
      members: cls.students,
    };
  }
  const [isStudent, g2, c] = isStudentID(metadata, id);
  if (isStudent) {
    const grade = metadata.grades[g2];
    const cls = grade.classes[c];
    const student = cls.students.find((v) => v === id);
    if (!student) {
      throw new Error("invalid student id");
    }
    return {
      desc: student.toString(),
      members: [student],
    };
  }
  throw new Error("invalid id");
}

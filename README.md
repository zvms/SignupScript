# SignupScript

The SingupScript for ZVMS.

## Statements

- `must <expr>`
  return `false` if `<expr>` is `false`, otherwise continue
- `just <expr>`
  return `true` if `<expr>` is `true`, otherwise continue
- `return <expr>`
  return `<expr>` and stop
- assignment: `<id> = <expr>`
  e.g. `new = before & 202203`
- comment: `# <comment>`

If the program reaches the end, it implicitly executes `return true`.

## Operators

> by priority

1. union: `&`(alias: `in`), `|`
   e.g. `20220301 in before` -> {`20220301`} or {}
   e.g. `202203 | 202204` -> {`20220301`, `20220302`, ..., `20220401`, `20220402`, ...}
   e.g. `before & 202203` -> (maybe){`20220320`, `20220321`}
2. algebra: `+`, `-`
3. comparison: `==`, `!=`, `>`, `>=`, `<`, `<=`
4. logic: `!`, `&&`, `||`

## Types

- union (of student)
- int
- boolean

## Numeric Literals

- `[0,2000]`: number itself
- `(2000,10000)`: grade id
- `[10000,1000000)`: class id
- `[1000000,1000000000)`: student id
- otherwise: invalid

## Implicit Conversion

- any id is always converted to union
  e.g. `202203` -> {`20220301`, `20220302`, ... }
  e.g. `20220320` -> {`20220320`}
- union is converted to int by its size when doing algebra
  e.g. `202203 + 1`->`46`
  e.g. `10 - before`->`3`
- int is converted to boolean by whether it greater than zero
  e.g. `-3`->`false`
  e.g. `0`->`false`
  e.g. `3`->`true`

## IO

### Input

- `before`: union of students who has signed up
  e.g. {`20220101`, `20220202`}
- `new`: student who wants to sign up
  e.g. `20220303`
- `after`: union of students who has signed up after the new student signs up
  definition: `final = initial | delta`
  e.g. {`20220101`, `20220202`, `20220303`}

### Output

`true` or `false`, indicating whether the student can sign up

## Examples

See [`example.signup`](./example.signup).


## AST Structure

See [`ast.d.ts`](./ast.d.ts).

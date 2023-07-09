# SignupScript

The SignupScript for ZVMS.

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

1. union: `&`, `|`
   e.g. `202203 | 202204` -> {`20220301`, `20220302`, ..., `20220401`, `20220402`, ...}
   e.g. `before & 202203` -> (maybe){`20220320`, `20220321`}
2. `in` operator. In fact it is `&` with smaller priority.
   e.g. `before in 202203|202204`
3. algebra: `+`, `-`
4. comparison: `==`, `!=`, `>`, `>=`, `<`, `<=`
5. logic: `!`, `&&`, `||`

## Types

- union (of student)
- int
- boolean

## Numeric Literals

- `[0,2000]`: number itself
- `(2000,10000)`: grade id
- `[100000,1000000)`: class id
- `[10000000,1000000000)`: student id
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

# 中文翻译 (by GitHub Copilot)

## 语句

- `must <expr>`
  如果 `<expr>` 为 `false`，则返回 `false`，否则继续执行
- `just <expr>`
  如果 `<expr>` 为 `true`，则返回 `true`，否则继续执行
- `return <expr>`
  返回 `<expr>` 并停止执行
- 赋值语句：`<id> = <expr>`
  例如：`new = before & 202203`
- 注释：`# <comment>`

## 运算符

> 按优先级排序

1. 集合运算：`&`、`|`
   例如：`202203 | 202204` -> {`20220301`、`20220302`、...、`20220401`、`20220402`、...}
   例如：`before & 202203` -> （可能是）{`20220320`、`20220321`}
2. `in` 运算符。实际上就是`&`，但优先级更低
   例如：`before in 202203|202204`
3. 代数运算：`+`、`-`
4. 比较运算：`==`、`!=`、`>`、`>=`、`<`、`<=`
5. 逻辑运算：`!`、`&&`、`||`

## 类型

- 集合（学生的集合）
- 整数
- 布尔值

## 数字字面量

- `[0,2000]`：数字本身
- `(2000,10000)`：年级 ID
- `[100000,1000000)`：班级 ID
- `[10000000,1000000000)`：学生 ID
- 其他：无效

## 隐式转换

- 任何 ID 都会被转换为集合
  例如：`202203` -> {`20220301`、`20220302`、...}
  例如：`20220320` -> {`20220320`}
- 集合在进行代数运算时会根据其大小转换为整数
  例如：`202203 + 1` -> `46`
  例如：`10 - before` -> `3`
- 整数在进行布尔运算时会根据其是否大于零转换为布尔值
  例如：`-3` -> `false`
  例如：`0` -> `false`
  例如：`3` -> `true`

## 输入输出

### 输入

- `before`：已经报名的学生的集合
  例如：{`20220101`、`20220202`}
- `new`：想要报名的学生
  例如：`20220303`
- `after`：新学生报名后的学生集合
  定义：`final = initial | delta`
  例如：{`20220101`、`20220202`、`20220303`}

### 输出

`true` 或 `false`，表示新学生是否可以报名

## 示例

请参考 example.signup。

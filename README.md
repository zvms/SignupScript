# SignupScript

The SingupScript for ZVMS.

## Statements

- `must`
- `just`
- assignment

## Operators

> by priority

1. union: `&`(alias: `in`), `|`
2. algebra: `+`, `-`
3. comparison: `==`, `!=`, `>`, `>=`, `<`, `<=`
4. logic: `&&`, `||`
5. assignment: `=`

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
- union is converted to int by its size when doing algebra
- int is converted to boolean by whether it is zero

## IO

### Input

- `current`: union of students who has signed up
- `new`: student who wants to sign up

### Output

`true` or `false`, indicating whether the student can sign up

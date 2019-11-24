
# retidy/transforms

## Features 

* [x] Write each variable declaration in its own statement, [use one variable declaration for each variable](https://eslint.org/docs/rules/one-var), [babel-plugin-transform-merge-sibling-variables](https://babeljs.io/docs/en/babel-plugin-transform-merge-sibling-variables)
* [x] Unminify booleans, `!0` -> `true`, `!1` -> `false`
* [x] Unminify boolean expressions into `if` `else` statements, e.g. `x && a()` -> `if (x) { a() }`, `x || a()` -> `if (!x) { a() }`, `x ? a() : b()` -> `if (x) { a() } else { b() }`, `return x && a()` -> `if (x) { return a() }` etc.
* [x] unminify return statement with its siblings, e.g. `return a(), b()` -> `a(); return b()`
* [x] unminify `return void a()` -> `a(); return`
* [x] Unminify numeric literals, e.g. `1e4` -> `10000`, `-2e5` -> `-200000`
* [x] add parentheses for binary expressions, forget confusing operator precedence! e.g. `3 > 2 > 1` -> `(3 > 2) > 1`
* [x] force to use curly braces around `if` `while` `for` block, https://eslint.org/docs/rules/curly, e.g. `if (a == 1) a++` -> `if (a == 1) { a++ }`
* [x] `void 0` -> `undefined`
* [x] [flip comparisons](https://babeljs.io/docs/en/babel-plugin-minify-flip-comparisons) again, `null !== bar` -> `bar !== null`
* [x] Unminify Infinity, `1 / 0` -> `Infinity`, [babel-plugin-minify-infinity](https://babeljs.io/docs/en/babel-plugin-minify-infinity)
* [x] unminify sequence expressions, `a(), b()` -> `a(); b()`

## Usage

### Use all transformers (transformAll)

```js
import { transformAll } from "retidy/dist/transforms"

transformAll(ast[, options])
```

### Disable specific transformer(s)

```js
import { transformAll } from "retidy/dist/transforms"

const options = { [transformerName]: false, }

transformAll(ast, options)
```

For example, disable `addCurlyBraces` transformer

```js
import { transformAll } from "retidy/dist/transforms"

transformAll(ast, { addCurlyBraces: false, })
```

### Use a single transformer

```js
import { allTransformers } from "retidy/dist/transforms"

allTransformers[transformerName](ast)
```

For example

```js
import { allTransformers } from "retidy/dist/transforms"

allTransformers.addCurlyBraces(ast)
```

## License

MIT

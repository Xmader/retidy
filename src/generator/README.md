
# retidy/generator

> JavaScript code generator from a Babel AST
> based on [recast's code printer (generator)](https://github.com/benjamn/recast/blob/master/lib/printer.ts)

## Improvements from recast's version

* [no trailing semicolons](https://github.com/Xmader/retidy/commit/db7049988)
* add [default options](./generator.ts#L6)

## Usage

```js
import generator from "retidy/dist/generator"

console.log(
    generator(ast[, options]).code
)
```

## License

MIT

([recast](https://github.com/benjamn/recast/blob/master/LICENSE) is also licensed under MIT.)

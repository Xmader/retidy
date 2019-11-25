
# Retidy

[![GitHub stars](https://img.shields.io/github/stars/Xmader/retidy?style=flat)](https://github.com/Xmader/retidy) [![npm](https://img.shields.io/npm/v/Xmader/retidy)](https://www.npmjs.com/package/retidy) ![npm downloads](https://img.shields.io/npm/dm/Xmader/retidy) ![](https://img.shields.io/badge/types-Typescript-blue) [![license](https://img.shields.io/github/license/Xmader/retidy)](/LICENSE)

> Extract, unminify, and beautify (\"retidy\") each file from a webpack/parcel bundle

⚠️ No Unit Tests, may have unexpected side effects ⚠️

## Installation

```sh
npm install -g retidy
```

## Usage

```js
import retidy from "retidy"

retidy(bundleCode[, options])
```

```ts
retidy(bundleCode: string, options?: Options): Promise<string[]>
```

If set `options.writeFiles = true` (by default), retidy will write extracted code files into the file system (under `options.outDir` directory, `./retidy-out/` by default).

## Options

see [src/options.ts](src/options.ts#L7)

## Example

```js
import retidy from "retidy"
import fs from "fs"

const code = fs.readFileSync("path/to/webpack-bundle.js", "utf-8")

retidy(code, { type: "webpack", outDir: "./out/", bundleAstReferenceKeys: ["body", 0, "expression", "right"] })
```

## License

MIT

## Legal note

Some companies specify in their terms of service that their code cannot be "reverse engineered".  
Hope you understand what you are doing so you don't break any agreements.

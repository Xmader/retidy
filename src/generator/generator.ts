
import { Printer, PrintResult, PrintResultType } from "./printer"
import { AST } from "../utils/ast"
import { Options } from "recast/lib/options"

const defaultOptions = {
    lineTerminator: "\n",
    quote: "double",
    trailingComma: {
        objects: true,
        arrays: false,
        parameters: false,
    },
    arrowParensAlways: true,
}

export const prettyPrint = (ast: AST, options?: Options): PrintResultType => {
    options = Object.assign({}, defaultOptions, options || {})

    if (Array.isArray(ast)) {
        const sep = options.lineTerminator.repeat(2)  // \n\n
        return new PrintResult(
            ast.map((n) => {
                return prettyPrint(n, options).code
            }).join(sep)
        )
    }

    return new Printer(options).printGenerically(ast)
}

/** @alias prettyPrint */
export const generator = prettyPrint
export default generator

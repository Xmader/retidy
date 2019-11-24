
import { Printer } from "./printer"
import { Node } from "@babel/types"
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

export const prettyPrint = (ast: Node, options?: Options) => {
    options = Object.assign({}, defaultOptions, options || {})
    return new Printer(options).printGenerically(ast)
}

/** @alias prettyPrint */
export const generator = prettyPrint
export default generator


import { AST } from "../utils/ast"

import unminifyNumericLiterals from "./unminify-numeric-literals"
import unminifyBooleans from "./unminify-booleans"
import transformVoidToUndefined from "./transform-void-to-undefined"
import unminifyInfinity from "./unminify-infinity"

export const allTransformers = {
    unminifyNumericLiterals,
    unminifyBooleans,
    transformVoidToUndefined,
    unminifyInfinity,
}

export type TransformOptions = {
    [transformerName in keyof typeof allTransformers]?: boolean
}

const defaultTransformOptions: TransformOptions = {

}

export const transformAll = (ast: AST, options?: TransformOptions) => {
    options = Object.assign({}, defaultTransformOptions, options)

    Object.entries(allTransformers).forEach(([name, fn]) => {
        if (!(options && typeof options !== "undefined" && options[name] === false)) {  // ignore undefined
            fn(ast)
        }
    })
    return ast
}

export default transformAll

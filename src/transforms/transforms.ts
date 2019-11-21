
import unminifyNumericLiterals from "./unminify-numeric-literals"
import unminifyBooleans from "./unminify-booleans"
import transformVoidToUndefined from "./transform-void-to-undefined"
import { AST } from "../utils/ast"

export const allTransformers = {
    unminifyNumericLiterals,
    unminifyBooleans,
    transformVoidToUndefined,
}

export type TransformOptions = {
    [transformerName in keyof typeof allTransformers]?: boolean
}

export const transformAll = (ast: AST, options: TransformOptions = {}) => {
    Object.entries(allTransformers).forEach(([name, fn]) => {
        if (!(options && typeof options !== "undefined" && options[name] === false)) {  // ignore undefined
            fn(ast)
        }
    })
    return ast
}

export default transformAll


import unminifyNumericLiterals from "./unminify-numeric-literals"
import unminifyBooleans from "./unminify-booleans"
import { AST } from "../utils/ast"

export const allTransformers = {
    unminifyNumericLiterals,
    unminifyBooleans,
}

export type TransformOptions = {
    [transformerName in keyof typeof allTransformers]?: boolean
}

export const transformAll = (ast: AST, options: TransformOptions = {}) => {
    Object.entries(allTransformers).forEach(([name, fn]) => {
        if (!(options && options[name] === false)) {  // ignore undefined
            fn(ast)
        }
    })
    return ast
}

export default transformAll

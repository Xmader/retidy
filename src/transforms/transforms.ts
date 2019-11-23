
import { AST } from "../utils/ast"

import unminifyNumericLiterals from "./unminify-numeric-literals"
import unminifyBooleans from "./unminify-booleans"
import transformVoidToUndefined from "./transform-void-to-undefined"
import unminifyInfinity from "./unminify-infinity"
import flipComparisons from "./flip-comparisons-again"
import unminifyVariableDeclarations from "./unminify-variable-declarations"
import addCurlyBraces from "./add-curly-braces"
import addParenthesesForBinaryExpressions from "./add-parentheses-for-binary-expressions"
import unminifyReturnStatement from "./unminify-return-statements"

import { combineTransformers } from "../utils/combine-transformers"

export const allTransformers = {
    unminifyNumericLiterals,
    unminifyBooleans,
    transformVoidToUndefined,
    unminifyInfinity,
    flipComparisons,
    unminifyVariableDeclarations,
    addCurlyBraces,
    unminifyReturnStatement,
    addParenthesesForBinaryExpressions,
}

export type TransformOptions = {
    [transformerName in keyof typeof allTransformers]?: boolean
}

const defaultTransformOptions: TransformOptions = {

}

export const transformAll = (ast: AST, options?: TransformOptions) => {
    options = Object.assign({}, defaultTransformOptions, options)

    const transformers = Object.entries(allTransformers).map(([name, fn]) => {
        if (!(options && typeof options !== "undefined" && options[name] === false)) {  // ignore undefined
            return fn
        }
    })

    const combinedTransformer = combineTransformers(...transformers)
    combinedTransformer(ast)

    return ast
}

export default transformAll

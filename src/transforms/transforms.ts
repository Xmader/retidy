
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
import unminifyReturnVoid from "./unminify-return-void"
import unminifyIfStatements from "./unminify-if-statements"
import unminifySequenceExpressions from "./unminify-sequence-expressions"

import { Transformer } from "../utils/visitor-wrapper"
import { combineTransformers } from "../utils/combine-transformers"

export const allTransformers = {
    unminifyNumericLiterals,
    unminifyBooleans,
    transformVoidToUndefined,
    unminifyInfinity,
    flipComparisons,
    unminifyVariableDeclarations,
    unminifyReturnStatement,
    unminifyReturnVoid,
    unminifySequenceExpressions,
    unminifyIfStatements,
    addCurlyBraces,
    addParenthesesForBinaryExpressions,
}

export type TransformOptions = {
    [transformerName in keyof typeof allTransformers]?: boolean
}

const defaultTransformOptions: TransformOptions = {

}

export const transformAll = (ast: AST, options?: TransformOptions, extraTransformers?: Transformer[]) => {
    options = Object.assign({}, defaultTransformOptions, options)

    const transformers: Transformer[] = []

    if (extraTransformers && Array.isArray(extraTransformers)) {
        if (!extraTransformers.every(f => typeof f == "function" && f.visitor)) {
            throw new TypeError("some or all of the extraTransformers are not instances of Transformer")
        }

        transformers.push(...extraTransformers)
    }

    Object.entries(allTransformers).map(([name, fn]) => {
        if (!(options && typeof options !== "undefined" && options[name] === false)) {  // ignore undefined
            transformers.push(fn)
        }
    })

    const combinedTransformer = combineTransformers(...transformers)
    combinedTransformer(ast)

    return ast
}

export default transformAll

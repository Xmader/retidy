
import { Options } from "../../options"
import { notWebpackBootstrapAstErr } from "./extract-modules"
import { ModuleId } from "../module"
import {
    isCallExpression,
    isReturnStatement,
    isSequenceExpression,
    isNumericLiteral,
    isArrayExpression,
    isAssignmentExpression,
    isIdentifier,
    isFunctionExpression,
    CallExpression,
    ArrayExpression,
    ObjectExpression,
} from "@babel/types"

export type ModulesAST = ArrayExpression | ObjectExpression

export interface WebpackBundleInfo {
    entryId: ModuleId;
    modulesAST: ModulesAST;
}

const entrypointNotfoundErr = () => new Error("options.entryPoint is undefined and failed to get entry id.")

export const getWebpackBundleInfo = (callAST: CallExpression, options: Options): WebpackBundleInfo => {

    const { callee, arguments: { 0: modulesAST } } = callAST
    if (isIdentifier(callee)) {
        throw new TypeError("This bundle looks like a webpack-jsonp bundle.\nset options.type = 'webpack-jsonp', and try again.")
    } else if (!isFunctionExpression(callee)) {
        throw notWebpackBootstrapAstErr()
    }

    // try to get entry id
    if (typeof options.entryPoint !== "string" || typeof options.entryPoint !== "number") {
        options.entryPoint = undefined
        try {
            // unminified file
            // the last statement:
            // e.g. `return __webpack_require__(__webpack_require__.s = 8);`

            // minified file
            // the last statement:
            // e.g. `return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=8)`

            const lastStatement = callee.body.body.pop()

            if (!isReturnStatement(lastStatement)) {
                throw new Error()
            }

            const e = lastStatement.argument

            let entryRequireCall: CallExpression

            if (isCallExpression(e)) {
                entryRequireCall = e
            } else if (isSequenceExpression(e)) {
                entryRequireCall = e.expressions.pop() as CallExpression
            }
            if (!isCallExpression(entryRequireCall)) {
                throw new Error()
            }

            const entryRequireCallArgument = entryRequireCall.arguments[0]
            if (isNumericLiteral(entryRequireCallArgument)) {
                options.entryPoint = entryRequireCallArgument.value
            } else if (isAssignmentExpression(entryRequireCallArgument)) {
                const a = entryRequireCallArgument.right
                if (isNumericLiteral(a)) {
                    options.entryPoint = a.value
                }
            }

            if (typeof options.entryPoint == "undefined") {
                throw new Error()
            }
        } catch (_) {
            throw entrypointNotfoundErr()
        }
    }

    return {
        entryId: options.entryPoint,
        modulesAST: modulesAST as ModulesAST,
    }

}

export const getWebpackJsonpBundleInfo = (callAST: CallExpression, options: Options): WebpackBundleInfo => {

    const { callee, arguments: callArgs } = callAST
    if (isFunctionExpression(callee)) {
        throw new TypeError("This bundle looks like a normal webpack bundle.\nset options.type = 'webpack', and try again.")
    }

    let callArguments = callArgs.length == 1
        ? (callArgs[0] as ArrayExpression).elements
        : callArgs

    // const [selfModuleIdArrE, modulesAST, entryIdArrE] = callArguments
    const [, modulesAST, entryIdArrE] = callArguments

    // try to get entry id
    if (typeof options.entryPoint !== "string" || typeof options.entryPoint !== "number") {
        options.entryPoint = undefined
        try {

            if (!isArrayExpression(entryIdArrE)) {
                throw new Error()
            }

            const [entryIdE] = entryIdArrE.elements

            if (!entryIdE || !isNumericLiteral(entryIdE)) {
                throw new Error()
            }

            options.entryPoint = entryIdE.value

        } catch (_) {
            // throw ENTRYPOINT_NOTFOUND_ERR
        }
    }

    return {
        entryId: options.entryPoint,
        modulesAST: modulesAST as ModulesAST,
    }

}

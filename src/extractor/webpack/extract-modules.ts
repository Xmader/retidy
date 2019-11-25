
import { Extractor, getInputProgramAST, ModulesObj } from "../extractor-utils"
import { ModuleId } from "../module"
import {
    isCallExpression,
    isFunctionExpression,
    isReturnStatement,
    isSequenceExpression,
    isStringLiteral,
    isNumericLiteral,
    isAssignmentExpression,
    isArrayExpression,
    isObjectExpression,
    isObjectProperty,
    isIdentifier,
    CallExpression,
    FunctionExpression,
    variableDeclaration,
    variableDeclarator,
    identifier,
} from "@babel/types"

const NOT_WEBPACK_BOOTSTRAP_AST_ERR = new TypeError("not a webpackBootstrap function call AST.")

const moduleFunctionParams = ["module", "exports", "__webpack_require__"]

export const extractModules: Extractor = (ast, options) => {

    ast = getInputProgramAST(ast)

    if (Array.isArray(options.bundleAstReferenceKeys)) {
        for (const k of options.bundleAstReferenceKeys) {
            ast = ast[k]
        }
    } else {
        throw new TypeError("options.moduleAstEntryKeys is not an array.")
    }

    if (!isCallExpression(ast)) {
        throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
    }

    const { callee, arguments: { 0: fArgument } } = (ast as CallExpression)
    if (!isFunctionExpression(callee)) {
        throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
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
            throw new Error("options.entryPoint is undefined and failed to get entry id.")
        }
    }

    const modules: ModulesObj = {}
    const solveModule = (moduleFunction: FunctionExpression, id: ModuleId) => {

        const isEntry = id == options.entryPoint

        // get module ast block
        if (!isFunctionExpression(moduleFunction)) {
            throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
        }
        const { params, body: moduleAST } = moduleFunction

        const modulePath = `${isEntry ? "entry_" : ""}${id}.ts`

        if (!options.replaceModuleFunctionParams) {
            // put module function params in module body 
            // minified `function(e,t,n){`
            // unminified `function(module, exports, __webpack_require__) {`
            // -> `const e = module; const t = exports; const n = __webpack_require__;`
            params.forEach((p, index) => {
                if (!isIdentifier(p)) {
                    throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
                }
                moduleAST.body.unshift(
                    variableDeclaration("const", [variableDeclarator(
                        identifier(p.name),
                        identifier(moduleFunctionParams[index])
                    )])
                )
            })
        } else {
            // TODO
        }

        modules[modulePath] = {
            id,
            ast: moduleAST,
            isEntry,
        }

    }

    if (isArrayExpression(fArgument)) {
        fArgument.elements.forEach(solveModule)
    } else if (isObjectExpression(fArgument)) {
        fArgument.properties.forEach((p) => {
            if (!isObjectProperty(p)) {
                throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
            }
            if (!isStringLiteral(p.key) && !isNumericLiteral(p.key)) {
                throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
            }
            if (!isFunctionExpression(p.value)) {
                throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
            }
            solveModule(p.value, p.key.value)
        })
    } else {
        throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
    }

    return {
        modules: modules,
        entry: options.entryPoint,
    }
}

export default extractModules

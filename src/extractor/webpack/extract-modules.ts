
import { Extractor, getInputProgramAST, ModulesObj } from "../extractor-utils"
import { ModuleId } from "../module"
import { getWebpackBundleInfo, getWebpackJsonpBundleInfo, WebpackBundleInfo } from "./bundle-info"
import {
    isCallExpression,
    isFunctionExpression,
    isStringLiteral,
    isNumericLiteral,
    isArrayExpression,
    isObjectExpression,
    isObjectProperty,
    isIdentifier,
    FunctionExpression,
    variableDeclaration,
    variableDeclarator,
    identifier,
    StringLiteral,
    NumericLiteral,
    Identifier,
} from "@babel/types"

export const NOT_WEBPACK_BOOTSTRAP_AST_ERR = new TypeError("not a webpackBootstrap function call AST.")

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

    let bundleInfo: WebpackBundleInfo
    if (options.type == "webpack-jsonp") {
        bundleInfo = getWebpackJsonpBundleInfo(ast, options)
    } else {
        // if (options.type == "webpack") {
        bundleInfo = getWebpackBundleInfo(ast, options)
    }

    const { entryId, modulesAST } = bundleInfo
    const ext = options.outputFileType == "typescript" ? "ts" : "js"
    const entryPath = `entry_${entryId}.${ext}`

    const modules: ModulesObj = {}
    const solveModule = (moduleFunction: FunctionExpression, id: ModuleId) => {

        const isEntry = id == entryId

        // an empty module funtion in a modulesAST (ArrayExpression), e.g. [,,, normal module funtion ]
        if (!moduleFunction) {
            return
        }

        // get module ast block
        if (!isFunctionExpression(moduleFunction)) {
            throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
        }
        const { params, body: moduleAST } = moduleFunction

        const modulePath = `${isEntry ? "entry_" : ""}${id}.${ext}`

        // put module function params in module body 
        // minified `function(e,t,n){`
        // unminified `function(module, exports, __webpack_require__) {`
        // -> `const e = module, t = exports, n = __webpack_require__`
        // -> `const e = module; const t = exports; const n = __webpack_require__;` (by transforms/unminify-variable-declarations.ts)
        moduleAST.body.unshift(
            variableDeclaration("const",
                params.map((p, index) => {
                    if (!isIdentifier(p)) {
                        throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
                    }
                    return variableDeclarator(
                        identifier(p.name),
                        identifier(moduleFunctionParams[index])
                    )
                })
            )
        )

        modules[modulePath] = {
            id,
            ast: moduleAST,
            isEntry,
        }

    }

    if (isArrayExpression(modulesAST)) {
        modulesAST.elements.forEach(solveModule)
    } else if (isObjectExpression(modulesAST)) {
        modulesAST.properties.forEach((p) => {
            if (!isObjectProperty(p)) {
                throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
            }
            if (!isStringLiteral(p.key) && !isNumericLiteral(p.key) && !isIdentifier(p.key)) {
                throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
            }
            if (!isFunctionExpression(p.value)) {
                throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
            }
            solveModule(p.value, (p.key as Identifier).name || (p.key as StringLiteral | NumericLiteral).value)
        })
    } else {
        throw NOT_WEBPACK_BOOTSTRAP_AST_ERR
    }

    return {
        modules: modules,
        entry: entryId,
        entryPath: entryPath,
    }
}

export default extractModules

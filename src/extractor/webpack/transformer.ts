
import { VisitorWrapper } from "../../utils/visitor-wrapper"
import { ModuleId } from "../module"
import { parseExpression } from "@babel/parser"
import { NodePath } from "@babel/traverse"
import {
    isVariableDeclaration,
    isIdentifier,
    isMemberExpression,
    isNumericLiteral,
    isStringLiteral,
    isFunctionExpression,
    identifier,
    callExpression,
    stringLiteral,
    memberExpression,
    objectExpression,
    objectProperty,
    booleanLiteral,
    Identifier,
    FunctionExpression,
    CallExpression,
    Program,
    toStatement,
} from "@babel/types"

const transformErr = () => new Error("something goes wrong.")
const unknownRuntimeFnErr = () => new Error("unknown webpack runtime function")

const REQUIRE_CALLEE = identifier("require")
const DEFINEPROPERTY_CALLEE = memberExpression(identifier("Object"), identifier("defineProperty")) // Object.defineProperty

const WEBPACK_REQUIRE_N_CALLEE = identifier("__webpack_getDefaultExport")
const WEBPACK_REQUIRE_N = toStatement(parseExpression(`
/**
 * @template T
 * @argument {T} m
 * @returns {T extends { __esModule: true } ? () => T['default'] : () => T}
 */
function ${WEBPACK_REQUIRE_N_CALLEE.name}(m) {
    var getter = m && m.__esModule ?
        function getDefault() { return m["default"] } :
        function getModuleExports() { return m }
        Object.defineProperty(getter, "a", { enumerable: true, get: getter })
    return getter
}
`) as FunctionExpression)

const addWebpackRequireNFn = (path: NodePath<CallExpression>) => {
    const rootNode = path.scope.getProgramParent().path.node as Program
    if (!rootNode.body.includes(WEBPACK_REQUIRE_N)) {
        rootNode.body.push(WEBPACK_REQUIRE_N)
    }
}

const isWebpackRequire = (node: object): node is Identifier => {
    return isIdentifier(node, { name: "__webpack_require__" })
}

/**
 * Transform variables defined in ModuleFunction params to their real values
 * 
 * minified ModuleFunction: `function(e,t,n){`,  
 * unminified: `function(module, exports, __webpack_require__) {`.
 * 
 * replace `e` with `module`, `t` with `exports`, `n` -> `__webpack_require__` in extracted program body,  
 * and transform `__webpack_require__` to normal `require`
 */
export const getModuleFunctionParamsTransformer = (entryId: ModuleId) => {
    return VisitorWrapper({

        Program(path) {
            const { node } = path

            const paramsTransE = node.body[0]
            if (!isVariableDeclaration(paramsTransE, { kind: "const" })) {
                throw transformErr()
            }

            paramsTransE.declarations.forEach((d) => {
                const { id, init } = d
                if (!isIdentifier(id) || !isIdentifier(init)) {
                    throw transformErr()
                }

                const paramName = id.name
                const realValue = init.name

                path.scope.rename(paramName, realValue)
            })

            // remove paramsTransE
            node.body.shift()
        },

        // transform `__webpack_require__`
        CallExpression(path) {
            const { node } = path
            const { callee, arguments: callArgs } = node

            // check __webpack_require__
            if (isWebpackRequire(callee)) {
                // transform `__webpack_require__` to normal `require`
                // `__webpack_require__(0)` -> `require("./0")`

                const { 0: requireIdE } = callArgs
                if (!isNumericLiteral(requireIdE) && !isStringLiteral(requireIdE)) {
                    throw transformErr()
                }

                const requireId = requireIdE.value
                const isEntryRequire = requireId == entryId
                const requirePath = `./${isEntryRequire ? "entry_" : ""}${requireId}`

                path.replaceWith(
                    callExpression(REQUIRE_CALLEE, [stringLiteral(requirePath)])
                )
            } else if ( // __webpack_require__.fn(exports, …
                isMemberExpression(callee) &&
                isWebpackRequire(callee.object) &&
                isIdentifier(callee.property)
            ) {
                const method = callee.property.name
                if (method == "d") {  // callArgs.length > 1
                    // transform `__webpack_require__.d(exports, "…", function(){…})`
                    // __webpack_require__.d: define getter function for harmony exports
                    const [, exportName, exportGetter] = callArgs
                    if (!isStringLiteral(exportName) && !isFunctionExpression(exportGetter)) {
                        throw transformErr()
                    }

                    path.replaceWith(
                        callExpression(DEFINEPROPERTY_CALLEE, [ // Object.defineProperty(exports, name, {…
                            identifier("exports"),
                            exportName,
                            objectExpression([ // { enumerable: true, get: exportGetter }
                                objectProperty(identifier("enumerable"), booleanLiteral(true)),
                                objectProperty(identifier("get"), exportGetter as FunctionExpression),
                            ])
                        ])
                    )
                } else if (method == "r") {
                    // transform `__webpack_require__.r(exports)
                    // __webpack_require__.r: define __esModule on exports
                    //                        (useless for our "re-tidied" code)

                    // path.replaceWithSourceString(
                    //      `Object.defineProperty(exports, '__esModule', { value: true });`
                    // )
                    path.replaceWith(
                        callExpression(DEFINEPROPERTY_CALLEE, [
                            identifier("exports"),
                            stringLiteral("__esModule"),
                            objectExpression([
                                objectProperty(identifier("value"), booleanLiteral(true)),
                            ])
                        ])
                    )
                } else if (method == "n") {
                    // __webpack_require__.n(…)
                    // __webpack_require__.n: getDefaultExport function for compatibility with non-harmony modules

                    if (callArgs.length !== 1 || !isIdentifier(callArgs[0])) {
                        throw transformErr()
                    }

                    path.replaceWith(
                        callExpression(WEBPACK_REQUIRE_N_CALLEE, callArgs)
                    )

                    addWebpackRequireNFn(path)
                } else {
                    throw unknownRuntimeFnErr()
                }
            }
        },

    })
}

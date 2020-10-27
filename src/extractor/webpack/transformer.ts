
import { VisitorWrapper } from "../../utils/visitor-wrapper"
import { ModuleId } from "../module"
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
} from "@babel/types"

const transformErr = () => new Error("something goes wrong.")
const unknownRuntimeFnErr = () => new Error("unknown webpack runtime function")

const REQUIRE_CALLEE = identifier("require")
const DEFINEPROPERTY_CALLEE = memberExpression(identifier("Object"), identifier("defineProperty")) // Object.defineProperty

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
                isIdentifier(callee.property) &&
                isIdentifier(callArgs[0], { name: "exports" })
            ) {
                if (callee.property.name == "d") {  // callArgs.length > 1
                    // transform `__webpack_require__.d(exports, "…", function(){…})`
                    // __webpack_require__.d: define getter function for harmony exports
                    const [, exportName, exportGetter] = callArgs
                    if (!isStringLiteral(exportName) && !isFunctionExpression(exportGetter)) {
                        console.log(node)
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
                } else if (callee.property.name == "r") {
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
                } else {
                    throw unknownRuntimeFnErr()
                }
            }
        },

    })
}

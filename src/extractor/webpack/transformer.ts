
import { VisitorWrapper } from "../../utils/visitor-wrapper"
import { ModuleId } from "../module"
import {
    isVariableDeclaration,
    isIdentifier,
    isNumericLiteral,
    identifier,
    callExpression,
    stringLiteral,
} from "@babel/types"

const ERR = new Error("something goes wrong.")

const REQUIRE_CALLEE = identifier("require")

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
                throw ERR
            }

            paramsTransE.declarations.forEach((d) => {
                const { id, init } = d
                if (!isIdentifier(id) || !isIdentifier(init)) {
                    throw ERR
                }

                const paramName = id.name
                const realValue = init.name

                path.scope.rename(paramName, realValue)
            })

            // remove paramsTransE
            node.body.shift()
        },

        // transform `__webpack_require__` to normal `require`
        // `__webpack_require__(0)` -> `require("./0")`
        CallExpression(path) {
            const { node } = path
            const { callee, arguments: { 0: requireIdE } } = node

            // check __webpack_require__
            if (!isIdentifier(callee, { name: "__webpack_require__" })) {
                return
            }

            if (!isNumericLiteral(requireIdE)) {
                throw ERR
            }

            const requireId = requireIdE.value
            const isEntryRequire = requireId == entryId
            const requirePath = `./${isEntryRequire ? "entry_" : ""}${requireId}`

            path.replaceWith(
                callExpression(REQUIRE_CALLEE, [stringLiteral(requirePath)])
            )
        },

    })
}

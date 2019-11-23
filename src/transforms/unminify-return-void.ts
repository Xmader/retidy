
import VisitorWrapper from "../utils/visitor-wrapper"
import {  returnStatement, expressionStatement, isUnaryExpression } from "@babel/types"

/**
 * `return void a()` -> `a(); return`
 */
export const unminifyReturnVoid = VisitorWrapper({
    ReturnStatement(path) {
        const { node } = path
        const { argument: argumentE } = node

        if (argumentE && isUnaryExpression(argumentE) && argumentE.operator == "void") {
            path.replaceWithMultiple([
                expressionStatement(argumentE.argument),
                returnStatement(),
            ])
        }

    },
})

export default unminifyReturnVoid

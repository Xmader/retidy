
import VisitorWrapper from "../utils/visitor-wrapper"
import { isSequenceExpression, returnStatement, expressionStatement } from "@babel/types"

/**
 * `return a(), b()` -> `a(); return b()`
 */
export const unminifyReturnStatement = VisitorWrapper({
    ReturnStatement(path) {
        const { node } = path

        if (isSequenceExpression(node.argument)) {
            const expressions = node.argument.expressions

            const realReturnE = expressions.pop()

            const siblings = expressions.map((e) => {
                return expressionStatement(e)
            })

            path.replaceWithMultiple([
                ...siblings,
                returnStatement(realReturnE),
            ])
        }

    },
})

export default unminifyReturnStatement

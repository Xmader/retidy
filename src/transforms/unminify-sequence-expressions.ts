
import VisitorWrapper from "../utils/visitor-wrapper"
import { isSequenceExpression, expressionStatement } from "@babel/types"

/**
 * `a(), b()` -> `a(); b()`
 */
export const unminifySequenceExpressions = VisitorWrapper({
    ExpressionStatement(path) {
        const { node } = path

        if (isSequenceExpression(node.expression)) {
            const { expressions } = node.expression

            path.replaceWithMultiple(
                expressions.map(e => {
                    return expressionStatement(e)
                })
            )
        }
    },
})

export default unminifySequenceExpressions


import VisitorWrapper from "../utils/visitor-wrapper"
import { ifStatement, returnStatement, expressionStatement, parenthesizedExpression, unaryExpression, isLogicalExpression, isConditionalExpression } from "@babel/types"

/**
 * `x && a()` -> `if (x) { a() }`  
 * `x || a()` -> `if (!x) { a() }`  
 * `x ? a() : b()` -> `if (x) { a() } else { b() }`  
 * `return x && a()` -> `if (x) { return a() }` etc.
 */
export const unminifyIfStatements = VisitorWrapper({

    ReturnStatement(path) {
        const { node: { argument: returnE } } = path

        /**
         * `return x ? a() : b()` -> `if (x) { return a() } else { return b() }`  
         */
        if (isConditionalExpression(returnE)) {
            path.replaceWith(
                ifStatement(
                    returnE.test,
                    returnStatement(returnE.consequent),
                    returnStatement(returnE.alternate),
                )
            )
            return
        }

        /**
         * `return x && a()` -> `if (x) { return a() }`  
         * `return x || a()` -> `if (!x) { return a() }`
         */
        if (isLogicalExpression(returnE)) {
            const test = returnE.operator == "||"
                ? unaryExpression("!", parenthesizedExpression(returnE.left))
                : returnE.left

            path.replaceWith(
                ifStatement(
                    test,
                    returnStatement(returnE.right),
                )
            )
            return
        }
    },

    ExpressionStatement(path) {
        const { node: { expression } } = path

        /**
         * `x ? a() : b()` -> `if (x) { a() } else { b() }`  
         */
        if (isConditionalExpression(expression)) {
            path.replaceWith(
                ifStatement(
                    expression.test,
                    expressionStatement(expression.consequent),
                    expressionStatement(expression.alternate),
                )
            )
            return
        }

        /**
         * `x && a()` -> `if (x) { a() }`  
         * `x || a()` -> `if (!x) { a() }`  
         */
        if (isLogicalExpression(expression)) {
            const test = expression.operator == "||"
                ? unaryExpression("!", parenthesizedExpression(expression.left))
                : expression.left

            path.replaceWith(
                ifStatement(
                    test,
                    expressionStatement(expression.right),
                )
            )
        }
    },

})

export default unminifyIfStatements

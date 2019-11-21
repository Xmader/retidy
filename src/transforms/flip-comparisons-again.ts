
import { isLiteral, isUnaryExpression, isObjectExpression, isArrayExpression } from "@babel/types"

import VisitorWrapper from "../utils/visitor-wrapper"
import isVoid0 from "../utils/is-void0"

const EQUALITY_BINARY_OPERATORS = ["==", "===", "!=", "!=="]
const BOOLEAN_NUMBER_BINARY_OPERATORS = [">", "<", ">=", "<="]

/**
 * `null !== bar` -> `bar !== null`
 * @see https://babeljs.io/docs/en/babel-plugin-minify-flip-comparisons (reversed)
 */
export const flipComparisons = VisitorWrapper({

    // modify from https://github.com/babel/minify/blob/master/packages/babel-plugin-minify-flip-comparisons/src/index.js
    BinaryExpression(path) {
        const { node } = path
        const { right, left } = node

        // Make sure we have a constant on the right.
        if (
            isLiteral(right) ||
            isVoid0(right) ||
            (isUnaryExpression(right) && isLiteral(right.argument)) ||
            isObjectExpression(right) ||
            isArrayExpression(right)
        ) {
            return
        }

        // Commutative operators.
        if (
            EQUALITY_BINARY_OPERATORS.indexOf(node.operator) >= 0 ||
            ["*", "^", "&", "|"].indexOf(node.operator) >= 0
        ) {
            node.left = right
            node.right = left
            return
        }

        if (BOOLEAN_NUMBER_BINARY_OPERATORS.indexOf(node.operator) >= 0) {
            node.left = right
            node.right = left
            let operator: ">" | "<" | ">=" | "<="
            switch (node.operator) {
                case ">":
                    operator = "<"
                    break
                case "<":
                    operator = ">"
                    break
                case ">=":
                    operator = "<="
                    break
                case "<=":
                    operator = ">="
                    break
            }
            node.operator = operator
            return
        }
    },

})

export default flipComparisons

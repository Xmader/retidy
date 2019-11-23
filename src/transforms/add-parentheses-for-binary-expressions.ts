
import VisitorWrapper from "../utils/visitor-wrapper"
import { Expression, isBinary, isLogicalExpression, parenthesizedExpression } from "@babel/types"

const basicMathOperators = ["+", "-", "/", "%", "*"]

const isBasicMathExpression = (e: Expression) => {
    return isBinary(e)
        && basicMathOperators.includes(e.operator)
}

const isSameLogicalExpression = (a: Expression, b: Expression) => {
    return isLogicalExpression(a)
        && isLogicalExpression(b)
        && a.operator == b.operator
}

const binaryExpressionSides: ["left", "right"] = ["left", "right"]

/**
 * `3 > 2 > 1` -> `(3 > 2) > 1`
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 */
export const addParenthesesForBinaryExpressions = VisitorWrapper({
    Binary(path) {
        const { node } = path
        binaryExpressionSides.forEach((side) => {
            if (
                isBinary(node[side])
                && !(isBasicMathExpression(node) && isBasicMathExpression(node[side]))
                && !isSameLogicalExpression(node, node[side])
            ) {
                node[side] = parenthesizedExpression(node[side])
            }
        })
    },
})

export default addParenthesesForBinaryExpressions

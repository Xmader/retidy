
import { isUnaryExpression, isNumericLiteral } from "@babel/types"

// modify from https://github.com/babel/minify/blob/master/packages/babel-helper-is-void-0/src/index.js
export const isVoid0 = (expr: object) => {
    return (
        isUnaryExpression(expr, { operator: "void" }) &&
        isNumericLiteral(expr.argument, { value: 0 })
    )
}

export default isVoid0


import VisitorWrapper from "../utils/visitor-wrapper"
import { NumericLiteral, identifier, isNumericLiteral } from "@babel/types"

/**
 * `1 / 0` -> `Infinity`
 * @see https://babeljs.io/docs/en/babel-plugin-minify-infinity (reversed)
 */
export const unminifyInfinity = VisitorWrapper({
    BinaryExpression(path) {
        const { node } = path

        if (node.operator == "/" && isNumericLiteral(node.left)&& isNumericLiteral(node.right)) {
            const left:NumericLiteral = node.left
            const right:NumericLiteral = node.right
            if (left.value === 1 && right.value === 0) {
                path.replaceWith(identifier("Infinity"))
            }
        }
    },
})

export default unminifyInfinity

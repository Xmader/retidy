
import VisitorWrapper from "../utils/visitor-wrapper"
import { NumericLiteral, booleanLiteral, isNumericLiteral } from "@babel/types"

/**
 * `!0` -> `true`, `!1` -> `false`
 * @see https://babeljs.io/docs/en/babel-plugin-transform-minify-booleans (reversed)
 */
export const unminifyBooleans = VisitorWrapper({
    UnaryExpression(path) {
        const { node } = path

        if (node.operator == "!" && isNumericLiteral(node.argument)) {
            const n = node.argument as NumericLiteral

            switch (n.value) {
                case 0:
                    path.replaceWith(booleanLiteral(true))
                    break

                case 1:
                    path.replaceWith(booleanLiteral(false))
                    break
            }
        }
    },
})

export default unminifyBooleans

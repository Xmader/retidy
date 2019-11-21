
import VisitorWrapper from "../utils/visitor-wrapper"
import { NumericLiteral, booleanLiteral, isNumericLiteral } from "@babel/types"

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

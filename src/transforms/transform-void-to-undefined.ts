
import VisitorWrapper from "../utils/visitor-wrapper"
import { NumericLiteral,  isNumericLiteral, identifier } from "@babel/types"

export const transformVoidToUndefined = VisitorWrapper({
    UnaryExpression(path) {
        const { node } = path

        if (node.operator == "void" && isNumericLiteral(node.argument)) {
            const n = node.argument as NumericLiteral
            if (n.value == 0) {
                path.replaceWith(identifier("undefined"))
            }
        }
    },
})

export default transformVoidToUndefined

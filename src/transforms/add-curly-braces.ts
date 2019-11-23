
import VisitorWrapper from "../utils/visitor-wrapper"
import { isBlockStatement, blockStatement, isIfStatement } from "@babel/types"

/**
 * `if (a == 1) a++` -> `if (a == 1) { a++ }`
 * @see https://eslint.org/docs/rules/curly
 */
export const addCurlyBraces = VisitorWrapper({
    Loop(path) {
        const { node } = path

        if (!isBlockStatement(node.body)) {
            node.body = blockStatement([node.body])
        }
    },

    IfStatement(path) {
        const { node } = path

        if (!isBlockStatement(node.consequent)) {
            node.consequent = blockStatement([node.consequent])
        }

        if (node.alternate && !isBlockStatement(node.alternate) && !isIfStatement(node.alternate)) {
            node.alternate = blockStatement([node.alternate])
        }
    },
})

export default addCurlyBraces

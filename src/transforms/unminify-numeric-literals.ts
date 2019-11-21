
import VisitorWrapper from "../utils/visitor-wrapper"

export const unminifyNumericLiterals = VisitorWrapper({
    NumericLiteral(path) {
        const { node } = path

        // @ts-ignore
        if (!node.extra) return

        // @ts-ignore
        node.extra.raw = node.value
    }
})

export default unminifyNumericLiterals

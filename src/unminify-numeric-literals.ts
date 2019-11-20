
import { VisitorWrapper, Visitor } from "./utils/visitor-wrapper"

export const visitor: Visitor = {
    NumericLiteral(path) {
        const { node } = path

        // @ts-ignore
        if (!node.extra) return

        // @ts-ignore
        node.extra.raw = node.value
    }
}

export const UnminifyNumericLiterals = VisitorWrapper(visitor)

export default UnminifyNumericLiterals

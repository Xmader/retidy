
import VisitorWrapper from "../utils/visitor-wrapper"

/**
 * e.g. `1e4` -> `10000`, `-2e5` -> `-200000`
 * @see https://babeljs.io/docs/en/babel-plugin-minify-numeric-literals (reversed)
 */
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

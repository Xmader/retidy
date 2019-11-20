
import traverse, { TraverseOptions } from "@babel/traverse"
import { File } from "@babel/types"

export const visitor: TraverseOptions = {
    NumericLiteral(path) {
        const { node } = path

        // @ts-ignore
        if (!node.extra) return

        // @ts-ignore
        node.extra.raw = node.value
    }
}

export const UnminifyNumericLiterals = (ast: File) => {
    traverse(ast, visitor)
}

export default UnminifyNumericLiterals

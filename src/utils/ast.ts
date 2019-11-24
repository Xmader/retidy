
import { Node, isNode } from "@babel/types"

export type AST = Node | Node[]

export const isAST = (ast: AST) => {
    if (Array.isArray(ast)) {
        return ast.every(isNode)
    } else {
        return isNode(ast)
    }
}

export const assertNotASTArray = (ast: AST) => {
    if (!isAST(ast)) {
        throw new TypeError("ast is not an instance of AST.")
    }

    if (Array.isArray(ast)) {
        throw new TypeError("not support for AST array input.")
    }
}

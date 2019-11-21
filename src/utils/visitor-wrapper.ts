
import traverse, { TraverseOptions } from "@babel/traverse"
import { AST } from "./ast"

export { TraverseOptions }
export type Visitor = TraverseOptions

export interface Transformer {
    (ast: AST): void;
    visitor: TraverseOptions;
}

export const VisitorWrapper = (visitor: Visitor): Transformer => {
    const traverseFn = (ast: AST) => {
        traverse(ast, visitor)
    }

    traverseFn.visitor = visitor

    return traverseFn
}

export default VisitorWrapper

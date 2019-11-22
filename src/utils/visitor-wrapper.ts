
import traverse, { TraverseOptions, VisitNodeObject, Visitor as BVisitor } from "@babel/traverse"
import { Node } from "@babel/types"
import { AST } from "./ast"

export { TraverseOptions }
export type StrictVisitor<S = Node> = Omit<BVisitor<S>, keyof VisitNodeObject<S, Node>>
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

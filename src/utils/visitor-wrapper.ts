
import traverse, { TraverseOptions } from "@babel/traverse"
import { File } from "@babel/types"

export { TraverseOptions }
export type Visitor = TraverseOptions

export const VisitorWrapper = (visitor: Visitor) => {
    const traverseFn = (ast: File) => {
        traverse(ast, visitor)
    }

    traverseFn.visitor = visitor

    return traverseFn
}

export default VisitorWrapper

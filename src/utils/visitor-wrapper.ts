
import traverse, { TraverseOptions } from "@babel/traverse"
import { File } from "@babel/types"

export { TraverseOptions }
export type Visitor = TraverseOptions

export const VisitorWrapper = (visitor: Visitor) => {
    return (ast: File) => {
        traverse(ast, visitor)
    }
}

export default VisitorWrapper

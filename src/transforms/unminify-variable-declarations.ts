
import VisitorWrapper from "../utils/visitor-wrapper"
import { variableDeclaration } from "@babel/types"

/**
 * @see https://babeljs.io/docs/en/babel-plugin-transform-merge-sibling-variables (reversed)
 * @see https://github.com/babel/minify/blob/master/packages/babel-plugin-minify-infinity/src/index.js
 */
export const unminifyVariableDeclarations = VisitorWrapper({
    VariableDeclaration(path) {
        const { node } = path
        const { declarations } = node

        if (declarations.length > 1) {
            path.replaceWithMultiple(
                declarations.map((d) => {
                    return variableDeclaration(node.kind, [
                        d,
                    ])
                })
            )
        }
    },
})

export default unminifyVariableDeclarations

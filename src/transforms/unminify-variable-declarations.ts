
import VisitorWrapper from "../utils/visitor-wrapper"
import { variableDeclaration, isFor, isVariableDeclaration } from "@babel/types"

/**
 * @see https://babeljs.io/docs/en/babel-plugin-transform-merge-sibling-variables (reversed)
 * @see https://github.com/babel/minify/blob/master/packages/babel-plugin-minify-infinity/src/index.js
 */
export const unminifyVariableDeclarations = VisitorWrapper({

    VariableDeclaration(path) {
        const { node } = path
        const { declarations } = node

        if (path.parent && isFor(path.parent)) {
            return
        }

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

    ForStatement(path) {
        const { node } = path

        if (isVariableDeclaration(node.init) && node.init.kind == "var") {
            const { declarations } = node.init

            if (declarations.length > 1) {
                node.init.declarations = [declarations.pop()]

                path.insertBefore(
                    variableDeclaration(node.init.kind, declarations)
                )
            }
        }
    },

})

export default unminifyVariableDeclarations

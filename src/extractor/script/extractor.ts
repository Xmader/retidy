
import { Extractor, getInputProgramAST } from "../extractor-utils"
import { blockStatement } from "@babel/types"

export const scriptExtractor: Extractor = (ast, options) => {
    ast = getInputProgramAST(ast)

    const ext = options.outputFileType == "typescript" ? "ts" : "js"
    const entryPath = `entry.${ext}`

    return {
        modules: {
            [entryPath]: {
                ast: blockStatement(ast.body)
            }
        }
    }
}

export default scriptExtractor

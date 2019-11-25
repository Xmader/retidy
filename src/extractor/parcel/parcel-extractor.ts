
import { Extractor } from "../extractor-utils"
import solveModules from "./solve-modules"
import extractModules from "./extract-modules"

export const parcelExtractor: Extractor = (ast, options) => {
    const modules = solveModules(extractModules(ast, options))
    return modules
}

export default parcelExtractor

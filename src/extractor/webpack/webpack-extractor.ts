
import { Extractor } from "../extractor-utils"
import { extractModules } from "./extract-modules"
// import { webpackTransformer } from "./transformer"

export const webpackExtractor: Extractor = (ast, options) => {
    const modules = extractModules(ast, options)

    // add webpack specific transformer
    // if (!options.extraTransformers || !Array.isArray(options.extraTransformers)) {
    //     options.extraTransformers = []
    // }
    // options.extraTransformers.push(webpackTransformer)

    return modules
}

export default webpackExtractor

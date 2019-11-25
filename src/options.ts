import { TransformOptions } from "./transforms/transforms"
import { Transformer } from "./utils/visitor-wrapper"
import { allExtractors } from "./extractor/extractor"
import { ModuleId } from "./extractor/module"

export interface Options {
    /** default: "webpack" */
    type?: keyof typeof allExtractors;

    /** default: "retidy-out" */
    outDir?: string;

    transformerOptions?: TransformOptions;
    extraTransformers?: Transformer[];

    /** 
     * webpack only  
     * a reference to the bundle ast (to the webpackBootstrap function call ast)
     * default: ["body", 0, "expression", "argument"]
     */
    bundleAstReferenceKeys?: (string | number)[];

    // override
    entryPoint?: ModuleId;

    /** 
     * webpack only, unusable  
     * (replaceModuleTopLevelVars)   
     * `function(t,e,n) { module body… }` -> `function(module, exports, __webpack_require__) { module body… }`
     */
    replaceModuleFunctionParams?: boolean;
}

const defaultOptions: Options = {
    type: "webpack",
    outDir: "retidy-out",
    bundleAstReferenceKeys: ["body", 0, "expression", "argument"],  // !function(modules){…
    replaceModuleFunctionParams: true,
}

export const normalizeOptions = (options?: Options): Options => {
    options = Object.assign({}, defaultOptions, options)
    return options
}

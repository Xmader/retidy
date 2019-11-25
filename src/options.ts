import { TransformOptions } from "./transforms/transforms"
import { Transformer } from "./utils/visitor-wrapper"
import { allExtractors } from "./extractor/extractor"
import { ModuleId } from "./extractor/module"
import { Options as generatorOptions } from "./generator/options"

export interface Options {
    /** 
     * bundle type  
     * @default "webpack"
     */
    type?: keyof typeof allExtractors;

    /** output files, otherwise only return "retidied" codes */
    writeFiles?: boolean;

    /** @default "retidy-out" */
    outDir?: string;

    transformerOptions?: TransformOptions;
    /**
     * extra transformers that run before any other transformers  
     * some extractors may add them by editing the options
     */
    extraTransformers?: Transformer[];

    generatorOptions?: generatorOptions;

    /** 
     * webpack only  
     * a reference to the bundle ast (to the webpackBootstrap function call ast)
     * @default ["body", 0, "expression", "argument"]
     */
    bundleAstReferenceKeys?: (string | number)[];

    // override
    entryPoint?: ModuleId;

    /** 
     * webpack only  
     * Transform variables defined in ModuleFunction params to their real values  
     * @see https://github.com/Xmader/retidy/blob/master/src/extractor/webpack/transformer.ts#L6
     */
    replaceModuleFunctionParams?: boolean;
}

export const defaultOptions: Options = {
    type: "webpack",
    writeFiles: true,
    outDir: "./retidy-out/",
    bundleAstReferenceKeys: ["body", 0, "expression", "argument"],  // !function(modules){…
    replaceModuleFunctionParams: true,
}

export const normalizeOptions = (options?: Options): Options => {
    options = Object.assign({}, defaultOptions, options)
    return options
}

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

    /** 
     * for the compatibility of module solving
     * @default "javascript"
     * @see https://www.typescriptlang.org/docs/handbook/modules.html
     */
    outputFileType?: "javascript" | "typescript";

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
    outputFileType: "javascript",
    bundleAstReferenceKeys: [],
    replaceModuleFunctionParams: true,
}

export const defaultAstRefs = {
    "webpack": ["body", 0, "expression", "argument"] as const,  // AST: `function(modules){…`
    "webpack-jsonp": ["body", 0, "expression"] as const,        // AST: `(window.webpackJsonp = window.webpackJsonp || []).push(…` or simply `webpackJsonp.push(…`
}

export const normalizeOptions = (options?: Options): Options => {
    options = Object.assign({}, defaultOptions, options)

    if (!options.bundleAstReferenceKeys || !options.bundleAstReferenceKeys.length) {
        options.bundleAstReferenceKeys = defaultAstRefs[options.type] || []
    }

    return options
}

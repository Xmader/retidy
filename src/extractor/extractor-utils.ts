
import { Program, File, isProgram, isFile } from "@babel/types"
import { Module, ModuleId } from "./module"
import { Options } from "../options"

// extractor input type
export type ExtractorInputAST = Program | File

export const getInputProgramAST = (ast: ExtractorInputAST) => {
    if (isFile(ast)) {
        ast = ast.program
    }

    if (!isProgram(ast)) {
        throw new TypeError("input is not a top level AST (File | Program)")
    }

    return ast
}

// extractor result type
export type ModulesObj = {
    [modulePath: string]: Module,
}
export type ModulesMap = Map<string, Module>
export interface ExtractResult {
    modules: ModulesObj | ModulesMap;
    entry?: ModuleId;
    entryPath?: string;
}

export interface Extractor {
    (ast: ExtractorInputAST, options?: Options): ExtractResult
}

import * as parser from "@babel/parser"
import { program, file } from "@babel/types"
import { Options, normalizeOptions } from "./options"
import extractor from "./extractor/extractor"
import { Module } from "./extractor/module"
import transformAll from "./transforms"
import generator from "./generator"

import { ensureDir, writeFile } from "fs-extra"
import { dirname, join as pathJoin } from "path"

export const resolveModule = async (modulePath: string, moduleInfo: Module, options: Options = {}) => {
    try {
        const { ast } = moduleInfo
        const { transformerOptions, extraTransformers, generatorOptions } = options

        const fileAST = file(program(ast.body), null, null)

        transformAll(fileAST, transformerOptions, extraTransformers)

        const code = generator(fileAST, generatorOptions).code

        if (options.writeFiles) {
            const outputPath = pathJoin(options.outDir, modulePath)
            await ensureDir(dirname(outputPath))
            await writeFile(outputPath, code)
        }

        console.log(modulePath, "ok.")

        return code
    } catch (err) {
        console.error(modulePath, "error:", err)
    }
}

export const retidy = async (bundleCode: string, options?: Options) => {
    options = normalizeOptions(options)

    if (options.writeFiles) {
        await ensureDir(options.outDir)
    }

    const ast = parser.parse(bundleCode)
    const { modules } = extractor(ast, options)

    const resolveMapFn = ([modulePath, moduleInfo]: [string, Module]) => {
        return resolveModule(modulePath, moduleInfo, options)
    }

    if (modules instanceof Map) {
        return Promise.all(
            [...modules.entries()].map(resolveMapFn)
        )
    } else {
        return Promise.all(
            Object.entries(modules).map(resolveMapFn)
        )
    }
}

export default retidy


import { AssetId } from "../module"
import { ParcelExtractedModules } from "./extract-modules"
import { ExtractResult, ModulesObj } from "../extractor-utils"
import { Options } from "../../options"
import { URL } from "url"
import { extname } from "path"
import isRelativeModulePath from "../../utils/is-relative-module-path"

const normalizeModulePath = (path: string, outputExt: string = "js") => {
    let p = path.match(/^file:\/\/(?:\.+\/)?(.+)/)[1]
    const e = extname(p)
    if (!e || !(e == ".js" || e == ".json" || e == ".jsx" || e == ".ts" || e == ".tsx")) {
        p += `.${outputExt}`  // ".js"
    }
    return p
}

export const solveModules = (parcelExtracted: ParcelExtractedModules, options: Options): ExtractResult => {
    const { entry: entryId, modulesMap } = parcelExtracted

    const pathsMap = new Map<AssetId, string>()

    const solveRelativeRequires = (selfId: AssetId, selfPath: string) => {
        if (pathsMap.has(selfId)) {
            return
        }

        pathsMap.set(selfId, selfPath)

        const requiresMap = modulesMap.get(selfId).requires

        Object.entries(requiresMap).forEach(([p, id]) => {
            // don't solve node_modules
            if (!isRelativeModulePath(p)) {
                return
            }

            const moduleP = new URL(p, selfPath).href

            // recursive solving
            solveRelativeRequires(id, moduleP)
        })
    }

    solveRelativeRequires(entryId, "file://./entry")

    // if (pathsMap.size != parcelExtracted.modulesMap.size) {
    //     throw new Error("something goes wrong")
    // }

    const ext = options.outputFileType == "typescript" ? "ts" : "js"

    const modules: ModulesObj = {}
    pathsMap.forEach((modulePath, id) => {
        const p = normalizeModulePath(modulePath, ext)
        modules[p] = modulesMap.get(id)
    })

    return {
        modules,
        entry: entryId,
        entryPath: `entry.${ext}`
    }
}

export default solveModules

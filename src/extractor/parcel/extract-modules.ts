
import { AssetId, Module } from "../module"
import { ExtractorInputAST, getInputProgramAST } from "../extractor-utils"
import { Options } from "../../options"
import {
    isExpressionStatement,
    isAssignmentExpression,
    isIdentifier,
    isCallExpression,
    isArrayExpression,
    isObjectExpression,
    isObjectProperty,
    isStringLiteral,
    isNumericLiteral,
    isFunctionExpression,
    StringLiteral,
    NumericLiteral,
} from "@babel/types"

export interface ParcelRequireMap {
    [requireRelativePath: string]: AssetId;
}
export interface ParcelModule extends Module {
    requires?: ParcelRequireMap;
}

export interface ParcelExtractedModules {
    entry: AssetId,
    modulesMap: Map<AssetId, ParcelModule>,
}

const NOT_PARCEL_BUNDLE_ERR = new TypeError("input is not a parcel bundle AST")

export const extractModules = (ast: ExtractorInputAST, options: Options): ParcelExtractedModules => {

    ast = getInputProgramAST(ast)

    // check parcel bundle
    const parcelRequireES = ast.body[0]  // parcelRequire=xxx
    if (!isExpressionStatement(parcelRequireES)) {
        throw NOT_PARCEL_BUNDLE_ERR
    }

    const parcelRequireE = parcelRequireES.expression
    // https://github.com/parcel-bundler/parcel/blob/fe0066b/packages/core/parcel-bundler/src/builtins/prelude.js
    if (!isAssignmentExpression(parcelRequireE) || !isIdentifier(parcelRequireE.left) || !isCallExpression(parcelRequireE.right)) {
        throw NOT_PARCEL_BUNDLE_ERR
    }
    if (parcelRequireE.left.name !== "parcelRequire") {
        throw NOT_PARCEL_BUNDLE_ERR
    }

    // https://github.com/parcel-bundler/parcel/blob/c2760fd/packages/core/parcel-bundler/src/packagers/JSPackager.js#L229
    const [parcelModulesObj, , entryA, /* globalName */] = parcelRequireE.right.arguments

    // get entry asset id
    if (!isArrayExpression(entryA)) {
        throw NOT_PARCEL_BUNDLE_ERR
    }
    const entryAssetIdE = entryA.elements.pop() as StringLiteral | NumericLiteral
    let entryAssetId: AssetId = entryAssetIdE.value

    // override
    if (options && options.entryPoint) {
        entryAssetId = options.entryPoint
    }

    // extract modules
    if (!isObjectExpression(parcelModulesObj)) {
        throw NOT_PARCEL_BUNDLE_ERR
    }
    const parcelModules = parcelModulesObj.properties.map((p): ParcelModule => {
        if (!isObjectProperty(p)) {
            return
        }

        // type AssetId = string | number
        if (!(isStringLiteral(p.key) || isNumericLiteral(p.key))) {
            throw NOT_PARCEL_BUNDLE_ERR
        }
        const id = p.key.value
        const isEntry = id == entryAssetId

        // modules are defined as an array: [ module function, map of requires ]
        if (!isArrayExpression(p.value)) {
            throw NOT_PARCEL_BUNDLE_ERR
        }
        const [moduleFunction, requires] = p.value.elements

        // get module ast block
        // function(require,module,exports) { …
        if (!isFunctionExpression(moduleFunction)) {
            throw NOT_PARCEL_BUNDLE_ERR
        }
        if (moduleFunction.params.length !== 3 || !moduleFunction.params.every(x => isIdentifier(x))) {
            throw NOT_PARCEL_BUNDLE_ERR
        }
        const moduleAST = moduleFunction.body

        const moduleRequires: ParcelRequireMap = {}
        if (!isObjectExpression(requires)) {
            throw NOT_PARCEL_BUNDLE_ERR
        }
        requires.properties.forEach((r) => {
            if (!isObjectProperty(r)) {
                throw NOT_PARCEL_BUNDLE_ERR
            }

            if (!(isStringLiteral(r.value) || isNumericLiteral(r.value))) {
                throw NOT_PARCEL_BUNDLE_ERR
            }

            if (!isStringLiteral(r.key)) {
                throw NOT_PARCEL_BUNDLE_ERR
            }

            moduleRequires[r.key.value] = r.value.value
        })

        return {
            id,
            ast: moduleAST,
            requires: moduleRequires,
            isEntry,
        }
    })

    const parcelModulesMap = new Map<AssetId, ParcelModule>(parcelModules.map(m => [m.id, m]))

    return {
        entry: entryAssetId,
        modulesMap: parcelModulesMap,
    }
}

export default extractModules

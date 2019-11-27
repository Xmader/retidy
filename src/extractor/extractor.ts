
import { Extractor } from "./extractor-utils"
import { Options } from "../options"

import parcelExtractor from "./parcel/parcel-extractor"
import webpackExtractor from "./webpack/webpack-extractor"

export const allExtractors = {
    "parcel": parcelExtractor,
    // "parcel-v1": parcelExtractor,  // alias
    // "parcel-v2": parcelV2Extractor,  // parcel v2 is unreleased
    "webpack": webpackExtractor,
    "webpack-jsonp": webpackExtractor,
}

export const extractor: Extractor = (ast, options?: Options) => {
    // options = normalizeOptions(options)  // some extractors need to edit the options
    const singleExtractor: Extractor = allExtractors[options.type]
    return singleExtractor(ast, options)
}

export default extractor

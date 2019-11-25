
// https://parceljs.org/module_resolution.html
export const isRelativeModulePath = (path: string) => {
    return path.startsWith("./")
        || path.startsWith(".\\")
        || path.startsWith("../")
        || path.startsWith("..\\")
        || path.startsWith("~/")
        || path.startsWith("~\\")
}

export default isRelativeModulePath

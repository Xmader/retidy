
export const toArray = <T>(x: T | T[]): T[] => {
    if (Array.isArray(x)) {
        return x
    } else {
        return [x]
    }
}

export default toArray

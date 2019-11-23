
import { Printer } from "./printer"
import { Node } from "@babel/types"
import { Options } from "recast/lib/options"

export const prettyPrint = (ast: Node, options?: Options) => {
    return new Printer(options).printGenerically(ast)
}

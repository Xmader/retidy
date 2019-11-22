
import { VisitNodeFunction } from "@babel/traverse"
import { Node } from "@babel/types"

import { Transformer, Visitor, StrictVisitor, VisitorWrapper } from "./visitor-wrapper"
import toArray from "../utils/to-array"

type VisitNodeObjectE<S, P> = {
    enter?: VisitNodeFunction<S, P>[];
    exit?: VisitNodeFunction<S, P>[];
}
type VisitObjectMap<S> = Map<keyof StrictVisitor, VisitNodeObjectE<S, Extract<Node, { type: keyof StrictVisitor; }>>>

const visitorIgnoreKeys = ["scope", "noScope", "enter", "exit"]

export const combineVisitors = (...visitors: Visitor[]) => {

    const visitObjectMap = new Map() as VisitObjectMap<Node>

    visitors.forEach((visitor: StrictVisitor) => {
        Object.entries(visitor).forEach(
            ([visitNodeType, visitNodeObject]: [keyof StrictVisitor, StrictVisitor[keyof StrictVisitor]]) => {
                if (visitorIgnoreKeys.includes(visitNodeType)) {
                    return
                }

                if (!visitObjectMap.has(visitNodeType)) {
                    visitObjectMap.set(visitNodeType, { enter: [], exit: [] })
                }

                const { enter, exit } = visitObjectMap.get(visitNodeType)

                if (typeof visitNodeObject == "function") {
                    enter.push(visitNodeObject)
                } else {
                    if (visitNodeObject.enter) {
                        enter.push(...toArray(visitNodeObject.enter))
                    }

                    if (visitNodeObject.exit) {
                        exit.push(...toArray(visitNodeObject.exit))
                    }
                }

            }
        )
    })

    const combinedVisitor: StrictVisitor = {}

    visitObjectMap.forEach((visitNodeObjectE, visitNodeType) => {

        // const combinedVisitNodeObject: VisitNodeObject<Node, Extract<Node, { type: typeof visitNodeType; }>> = {}

        // for (const type of (["enter", "exit"] as ["enter", "exit"])) {
        //     if (visitNodeObjectE[type].length > 0) {
        //         if (visitNodeObjectE[type].length == 1) {
        //             combinedVisitNodeObject[type] = visitNodeObjectE[type][0]
        //         } else {
        //             combinedVisitNodeObject[type] = function (path, state) {
        //                 visitNodeObjectE[type].forEach((fn) => {
        //                     fn = fn.bind(this)
        //                     // @ts-ignore
        //                     fn(path, state)
        //                 })
        //             }
        //         }
        //     }
        // }


        // @ts-ignore
        combinedVisitor[visitNodeType] = visitNodeObjectE

    })

    return combinedVisitor
}

export const combineTransformers = (...transformers: Transformer[]) => {
    const visitors = transformers.map((t) => {
        return t.visitor
    })
    const combinedVisitor = combineVisitors(...visitors)
    return VisitorWrapper(combinedVisitor)
}

export default combineTransformers

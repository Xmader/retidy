#!/usr/bin/env node
// @ts-check

const { retidy } = require("../dist/index")
const { allExtractors } = require("../dist/extractor/extractor")
const { defaultOptions } = require("../dist/options")
const { readFileSync } = require("fs")
const yargs = require("yargs")

// @ts-ignore
const { name, description } = require("../package.json")

const usage = `${name}: \n${description}\n\nUsage: $0 -i <bundle_file> -o <out_dir>`

const argv = yargs.scriptName(name).usage(usage).options({
    "o": {
        alias: ["out-dir"],
        type: "string",
        default: defaultOptions.outDir,
        normalize: true,
    },
    "i": {
        alias: ["input-bundle"],
        type: "string",
        demandOption: true,
        normalize: true,
    },
    "t": {
        alias: ["type"],
        type: "string",
        choices: Object.keys(allExtractors),
        default: defaultOptions.type,
        describe: "bundle type",
    },
    "bundle-ast-reference": {
        alias: ["b"],
        type: "array",
        default: defaultOptions.bundleAstReferenceKeys,
        describe: "a reference to the bundle ast \n(to the webpackBootstrap function call ast)\n(webpack only)",
    },
}).version().help().wrap(yargs.terminalWidth()).argv

const code = readFileSync(argv["i"], "utf-8")

retidy(code, {
    type: argv["t"],
    outDir: argv["o"],
    bundleAstReferenceKeys: argv["bundle-ast-reference"],
})


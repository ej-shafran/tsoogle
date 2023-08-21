#!/usr/bin/env node

import ts from "typescript";
import { command, flag, positional, run } from "cmd-ts";
import { ExistingPath } from "cmd-ts/batteries/fs";
import assert from "assert";
import { checkDiagnostics, readConfig } from "./utils";

const app = command({
  name: "tsoogle",
  args: {
    fileName: positional({
      type: ExistingPath,
      displayName: "entry",
      description: "Entry point to the TypeScript source code",
    }),
    checkDiagnostics: flag({
      long: "check-diagnostics",
      short: "c",
      description: "Whether to check for (and error on) TypeScript errors",
      defaultValue: () => false,
    }),
  },
  async handler(args) {
    const options = readConfig(args.fileName);

    const program = ts.createProgram({
      rootNames: [args.fileName],
      options,
    });

    const checker = program.getTypeChecker();

    if (args.checkDiagnostics) {
      checkDiagnostics(program);
    }

    const tsoogleDeclarations = program
      .getSourceFiles()
      .flatMap((sourceFile) => {
        const external =
          program.isSourceFileFromExternalLibrary(sourceFile) ||
          sourceFile.isDeclarationFile;

        if (external) return [];

        const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
        assert(moduleSymbol, "Source file is not a module");

        const exports = checker.getExportsOfModule(moduleSymbol);
        return [[sourceFile.fileName, exports.length]];
      });

    console.log(tsoogleDeclarations);
  },
});

run(app, process.argv.slice(2));

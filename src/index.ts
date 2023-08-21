#!/usr/bin/env node

import ts from "typescript";
import { command, flag, positional, run } from "cmd-ts";
import { ExistingPath } from "cmd-ts/batteries/fs";
import assert from "assert";
import { NAME, checkDiagnostics, debug, readConfig } from "./utils";

const app = command({
  name: NAME,
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
    debug("running %s, arguments were %o", NAME, args);

    const options = readConfig(args.fileName);

    const program = ts.createProgram({
      rootNames: [args.fileName],
      options,
    });

    const checker = program.getTypeChecker();

    if (args.checkDiagnostics) {
      debug("checking diagnostics...");
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
        assert(moduleSymbol, "source file is not a module");

        const exports = checker.getExportsOfModule(moduleSymbol);
        return [[sourceFile.fileName, exports.length]];
      });

    console.log(tsoogleDeclarations);
  },
});

run(app, process.argv.slice(2));

#!/usr/bin/env node

import ts from "typescript";
import { command, positional, run } from "cmd-ts";
import { ExistingPath } from "cmd-ts/batteries/fs";
import assert from "assert";
import path from "path";
import { fileExists, readConfig } from "./utils";

const app = command({
  name: "tsoogle",
  args: {
    fileName: positional({
      type: ExistingPath,
      displayName: "entry",
      description: "Entry point to the TypeScript source code",
    }),
  },
  async handler({ fileName }) {
    const configFile = ts.findConfigFile(path.dirname(fileName), fileExists);
    const result = readConfig(configFile);
    const program = ts.createProgram({ rootNames: [fileName], options: result });

    const checker = program.getTypeChecker();

    const tsoogleDeclarations = program
      .getSourceFiles()
      .flatMap((sourceFile) => {
        const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);

        assert(
          !diagnostics.length,
          `${sourceFile.fileName}:\n${diagnostics
            .map((diagnostic) => diagnostic.messageText)
            .join("\n")}`
        );

        const external =
          program.isSourceFileFromExternalLibrary(sourceFile) ||
          sourceFile.isDeclarationFile;

        if (external) return [];

        const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
        assert(moduleSymbol, "Source file is not a module");

        const exports = checker.getExportsOfModule(moduleSymbol);
        return [[sourceFile, exports.length]];
      });

    console.log(tsoogleDeclarations);
  },
});

run(app, process.argv.slice(2));

#!/usr/bin/env node

import ts from "typescript";
import { command, flag, positional, run } from "cmd-ts";
import { ExistingPath } from "cmd-ts/batteries/fs";
import { NAME, checkDiagnostics, debug, readConfig, getExports } from "./utils";

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

    const sourceFiles = program
      .getSourceFiles()
      .filter(
        (sourceFile) =>
          !program.isSourceFileFromExternalLibrary(sourceFile) &&
          !sourceFile.isDeclarationFile
      );

    const exports = getExports(sourceFiles, checker);
    console.log("exports: ", exports);

    // const tsoogleDeclarations = sourceFiles.flatMap((sourceFile) => {
    //   return sourceFile.fileName;
    // });
    //
    // console.log(tsoogleDeclarations);
  },
});

run(app, process.argv.slice(2));

#!/usr/bin/env node

import ts from "typescript";
import {
  command,
  flag,
  number,
  option,
  optional,
  positional,
  run,
  string,
} from "cmd-ts";
import { ExistingPath } from "cmd-ts/batteries/fs";
import {
  NAME,
  checkDiagnostics,
  debug,
  readConfig,
  getExports,
  levDistance,
} from "./utils";
import { TsoogleSignature, getTsoogleSignature } from "./get-tsoogle-signature";

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
    search: option({
      type: optional(string),
      long: "search",
      short: "s",
      description: "The type siganture to search for",
    }),
    limit: option({
      type: number,
      long: "limit",
      short: "l",
      description: "The amount of results to show",
      defaultValue: () => 10,
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

    const tsoogleDeclarations = sourceFiles.flatMap((sourceFile) => {
      return sourceFile
        .getChildren()
        .flatMap(function walk(node): TsoogleSignature[] {
          if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
            const result = getTsoogleSignature(node, checker);
            if (exports.some((name) => result.name === name)) {
              return [result];
            } else {
              return [];
            }
          }

          if (ts.isArrowFunction(node)) {
            const sibling = node.parent
              .getChildren()
              .find((child): child is ts.Identifier => ts.isIdentifier(child));
            const result = getTsoogleSignature(
              node,
              checker,
              sibling?.getText()
            );
            if (exports.some((name) => result.name === name)) {
              return [result];
            } else {
              return [];
            }
          }

          return node.getChildren().flatMap(walk);
        });
    });

    const declarationsToSearch = tsoogleDeclarations.map((declaration) => {
      const searchString = `${declaration.typeParams ?? ""
        }(${declaration.parameters.join(", ")}) => ${declaration.returnType}`;

      return {
        name: declaration.name,
        searchString,
      };
    });

    if (args.search) {
      declarationsToSearch.sort(
        (a, b) =>
          levDistance(a.searchString, args.search!) -
          levDistance(b.searchString, args.search!)
      );
    }

    declarationsToSearch.slice(0, args.limit).forEach((declaration) => {
      console.log(`${declaration.name} :: ${declaration.searchString}`);
    });
  },
});

run(app, process.argv.slice(2));

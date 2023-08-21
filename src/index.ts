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

import { NAME, checkDiagnostics, debug, readConfig, getExports } from "./utils";
import { TsoogleFunction } from "./tsoogle/tsoogle-function";
import { getFromTs } from "./tsoogle/get-from-ts";
import { getDistance } from "./tsoogle/distance-from-search";
import { stringify } from "./tsoogle/stringify";

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
        .flatMap(function walk(node): TsoogleFunction[] {
          if (ts.isFunctionDeclaration(node)) {
            const result = getFromTs(node, checker);
            if (exports.some((name) => result.name === name)) {
              return [result];
            } else {
              return [];
            }
          }

          // TODO prefix class name
          if (ts.isMethodDeclaration(node) && ts.isClassLike(node.parent)) {
            const className = node.parent.name?.getText();
            if (exports.some((name) => className === name)) {
              const result = getFromTs(node, checker);
              return [result];
            } else {
              return [];
            }
          }

          if (ts.isArrowFunction(node)) {
            const sibling = node.parent
              .getChildren()
              .find((child): child is ts.Identifier => ts.isIdentifier(child));

            const result = getFromTs(node, checker, sibling?.getText());

            if (exports.some((name) => result.name === name)) {
              return [result];
            } else {
              return [];
            }
          }

          return node.getChildren().flatMap(walk);
        });
    });

    if (args.search) {
      const search = args.search!;
      tsoogleDeclarations.sort((a, b) => {
        const aDistance = getDistance(a, search);
        const bDistance = getDistance(b, search);

        return aDistance - bDistance;
      });
    }

    tsoogleDeclarations.slice(0, args.limit).forEach((declaration) => {
      console.log(stringify(declaration));
    });
  },
});

run(app, process.argv.slice(2));

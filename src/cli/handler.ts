import ts from "typescript";

import { Args } from "./args";
import {
  name,
  checkDiagnostics,
  debug,
  readConfig,
  getExports,
} from "../utils";
import { TsoogleFunction } from "../tsoogle/tsoogle-function";
import { getFromSignature, getFromTs } from "../tsoogle/get-from-ts";
import { getDistance } from "../tsoogle/distance-from-search";
import { stringify } from "../tsoogle/stringify";

export async function handler(args: Args) {
  debug("running %s, arguments were %o", name, args);

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
        if (ts.isVariableDeclaration(node)) {
          const type = checker.getTypeAtLocation(node);
          const signatures = type.getCallSignatures();
          if (signatures.length > 0) {
            const tsoogle = getFromSignature(signatures[0], checker);
            const result = { ...tsoogle, name: node.name.getText() };
            if (exports.some((name) => result.name === name)) {
              return [result];
            } else {
              return [];
            }
          }
        }

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
}

import ts from "typescript";

import { Args } from "./args";
import {
  name,
  checkDiagnostics,
  debug,
  readConfig,
  getExportSymbols,
} from "../utils";
import { getFromClass, getFromSignature } from "../tsoogle/get-from-ts";
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

  const exportSymbols = getExportSymbols(sourceFiles, checker);

  const tsoogleDeclarations = exportSymbols.flatMap((symbol) => {
    const type = checker.getTypeOfSymbol(symbol);

    if (type.getConstructSignatures().length) {
      return getFromClass(symbol, checker);
    }

    const name = symbol.getName();
    const signatures = type.getCallSignatures();
    if (!signatures.length) return [];

    const result = getFromSignature(signatures[0], checker);
    return [{ ...result, name }];
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

import ts from "typescript";

import { getExportSymbols } from "../utils";
import { getFromClass, getFromSignature } from "./get-from-ts";
import { getDistance } from "./distance-from-search";

export function getFromProgram(program: ts.Program, search?: string) {
  const checker = program.getTypeChecker();

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

  if (search) {
    tsoogleDeclarations.sort((a, b) => {
      const aDistance = getDistance(a, search);
      const bDistance = getDistance(b, search);

      return aDistance - bDistance;
    });
  }

  return tsoogleDeclarations;
}

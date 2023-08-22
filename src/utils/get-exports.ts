import assert from "assert";
import ts from "typescript";

export function getExportSymbols(
  sourceFiles: ts.SourceFile[],
  checker: ts.TypeChecker
) {
  const results = [] as ts.Symbol[];

  for (const sourceFile of sourceFiles) {
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
      assert(false, "TODO");
    }

    const symbols = checker.getExportsOfModule(moduleSymbol);
    for (const symbol of symbols) {
      if (!results.some(({ name }) => symbol.name === name)) {
        results.push(symbol);
      }
    }
  }

  return results;
}

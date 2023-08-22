import ts from "typescript";

export function getExportSymbols(
  sourceFiles: ts.SourceFile[],
  checker: ts.TypeChecker
) {
  const results = [] as ts.Symbol[];

  for (const sourceFile of sourceFiles) {
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
      // TODO: handle this better
      const symbols = checker.getSymbolsInScope(
        sourceFile,
        ts.SymbolFlags.Function
      );
      return symbols;
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

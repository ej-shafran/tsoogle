import assert from "assert";
import ts from "typescript";

export function getExports(
  sourceFiles: ts.SourceFile[],
  checker: ts.TypeChecker
) {
  const exports = sourceFiles.flatMap((sourceFile) => {
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    assert(moduleSymbol, "source file is not a module");

    const exports = checker.getExportsOfModule(moduleSymbol);
    return exports.flatMap((symbol) => {
      const name = symbol.getName();
      if (name === "default") return [];
      return name;
    });
  });

  return Array.from(new Set(exports));
}

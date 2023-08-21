import ts from "typescript";

export function checkDiagnostics(program: ts.Program) {
  const host: ts.FormatDiagnosticsHost = {
    getNewLine: () => "\n",
    getCurrentDirectory: process.cwd,
    getCanonicalFileName: (fileName) => fileName,
  };

  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    const formatted = ts.formatDiagnosticsWithColorAndContext(
      diagnostics,
      host
    );
    console.error(formatted);
    process.exit(1);
  }
}

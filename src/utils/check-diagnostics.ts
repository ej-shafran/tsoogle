import ts from "typescript";

export const diagnosticHost: ts.FormatDiagnosticsHost = {
  getNewLine: () => "\n",
  getCurrentDirectory: process.cwd,
  getCanonicalFileName: (fileName) => fileName,
};

export function checkDiagnostics(program: ts.Program) {
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    const formatted = ts.formatDiagnosticsWithColorAndContext(
      diagnostics,
      diagnosticHost
    );
    console.error(formatted);
    process.exit(1);
  }
}

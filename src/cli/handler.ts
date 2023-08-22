import ts from "typescript";

import { Args } from "./args";
import { stringify } from "../tsoogle/stringify";
import { getFromProgram } from "../tsoogle/get-from-program";
import { name, debug, readConfig, checkDiagnostics } from "../utils";

export async function handler(args: Args) {
  debug("running %s, arguments were %o", name, args);

  const options = readConfig(args.fileName);

  const program = ts.createProgram({
    rootNames: [args.fileName],
    options,
  });

  if (args.checkDiagnostics) {
    debug("checking program diagnostics");
    checkDiagnostics(program);
  }

  const tsoogleDeclarations = getFromProgram(program);

  tsoogleDeclarations.slice(0, args.limit).forEach((declaration) => {
    console.log(stringify(declaration));
  });
}

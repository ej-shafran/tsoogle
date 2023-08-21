import { readFileSync } from "fs";
import ts from "typescript";

const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {};

const readFile = (fileName: string) => readFileSync(fileName, "utf-8");

export function readConfig(fileName: string | undefined): ts.CompilerOptions {
  if (fileName) {
    const { config, error } = ts.readConfigFile(fileName, readFile);

    if (!error) {
      return config.compilerOptions;
    } else {
      return DEFAULT_COMPILER_OPTIONS;
    }
  } else {
    return DEFAULT_COMPILER_OPTIONS;
  }
}

import { readFileSync } from "fs";
import { dirname } from "path";
import ts from "typescript";
import { accessSync } from "fs";

function fileExists(fileName: string) {
  try {
    accessSync(fileName);
    return true;
  } catch (error) {
    return false;
  }
}

const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {};

const readFile = (fileName: string) => readFileSync(fileName, "utf-8");

export function readConfig(fileName: string): ts.CompilerOptions {
  const configFile = ts.findConfigFile(dirname(fileName), fileExists);
  if (configFile) {
    const { config, error } = ts.readConfigFile(configFile, readFile);

    if (!error) {
      return config.compilerOptions;
    } else {
      return DEFAULT_COMPILER_OPTIONS;
    }
  } else {
    return DEFAULT_COMPILER_OPTIONS;
  }
}

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
  if (!configFile) {
    return DEFAULT_COMPILER_OPTIONS;
  }

  const { config, error } = ts.readConfigFile(configFile, readFile);
  if (error) {
    return DEFAULT_COMPILER_OPTIONS;
  }

  const { options, errors } = ts.convertCompilerOptionsFromJson(
    config.compilerOptions,
    fileName
  );
  if (errors) {
    return DEFAULT_COMPILER_OPTIONS;
  }

  return options;
}

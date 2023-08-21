import { readFileSync } from "fs";
import { dirname } from "path";
import ts from "typescript";
import { accessSync } from "fs";
import { utilDebug } from "./debug";
import { diagnosticHost } from "./check-diagnostics";

const debug = utilDebug.extend(readConfig.name);

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
    debug("could not find TSConfig file (for entrypoint %s)", fileName);
    debug("using default compiler options");
    return DEFAULT_COMPILER_OPTIONS;
  }

  const { config, error } = ts.readConfigFile(configFile, readFile);
  if (error) {
    debug("error reading TSConfig (at %s): %O", configFile, error);
    debug("using default compiler options");
    return DEFAULT_COMPILER_OPTIONS;
  }

  const { options, errors } = ts.convertCompilerOptionsFromJson(
    config.compilerOptions,
    fileName
  );
  if (errors.length) {
    debug("errors parsing compiler options:");
    const formatted = ts.formatDiagnostics(errors, diagnosticHost);
    debug(formatted);
    return DEFAULT_COMPILER_OPTIONS;
  }

  debug("TSConfig parsed successfully");
  debug("returning compiler options: %O", options);
  return options;
}

import { describe, expect } from "vitest";
import { fc, it } from "@fast-check/vitest";
import ts from "typescript";
import { getFromProgram } from "../src/tsoogle/get-from-program";
import { TsoogleFunction } from "../src/tsoogle/tsoogle-function";

const nameArb = fc.stringMatching(/^[a-zA-Z_]+$/);
const typeArb = fc.oneof(fc.constant("string"), fc.constant("boolean"));
const funcArb = fc.record({
  isExported: fc.boolean(),
  name: nameArb,
  returnType: typeArb,
  parameters: fc.uniqueArray(fc.record({ name: nameArb, type: typeArb }), {
    selector: (val) => val.name,
    size: "-1",
  }),
  typeParameters: fc.uniqueArray(nameArb, { size: "-2" }),
});

const getLine = (
  func: typeof funcArb extends fc.Arbitrary<infer T> ? T : never
) => {
  const typeParameters =
    func.typeParameters && func.typeParameters.length
      ? `<${func.typeParameters.join(", ")}>`
      : "";

  const parameters = func.parameters
    .map((param) => `${param.name}: ${param.type}`)
    .join(", ");
  const { name, returnType } = func;
  const isExported = func.isExported ? "export " : "";

  return `${isExported}function ${name}${typeParameters}(${parameters}): ${returnType} {}`;
};

const FIXTURE_FILE_NAME = "fixture.ts";
const setup = (fixture: string) => {
  const sourceFile = ts.createSourceFile(
    FIXTURE_FILE_NAME,
    fixture,
    ts.ScriptTarget.Latest
  );

  const host = ts.createCompilerHost({});
  host.getSourceFile = (fileName) => {
    if (fileName === FIXTURE_FILE_NAME) return sourceFile;
  };

  return ts.createProgram({
    rootNames: [FIXTURE_FILE_NAME],
    options: {},
    host,
  });
};

const prop = it.prop([
  fc.uniqueArray(funcArb, { selector: (func) => func.name }),
]);

describe("Tsoogle Search", () => {
  prop("gets all available members of a file", async (funcs) => {
    const fixture = funcs.map(getLine).join("\n");

    const program = setup(fixture);

    const result = getFromProgram(program);

    const isNotModule = funcs.every((func) => !func.isExported);
    for (const func of funcs) {
      const tsoogle: TsoogleFunction = {
        name: func.name,
        typeParameters: func.typeParameters,
        returnType: func.returnType,
        parameters: func.parameters.map((param) => param.type),
      };

      if (func.isExported || isNotModule) {
        expect(result).toContainEqual(tsoogle);
      } else {
        expect(result).not.toContainEqual(tsoogle);
      }
    }
  });
});

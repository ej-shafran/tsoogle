import ts from "typescript";
import { TsoogleFunction } from "./tsoogle-function";
import { stringify } from "./stringify";
import assert from "assert";

declare module "typescript" {
  interface TypeChecker {
    getExpandedParameters(
      signature: ts.Signature,
      skipUnionExpanding?: boolean
    ): [ts.Symbol[]];
  }
}

export function getFromSignature(
  signature: ts.Signature,
  checker: ts.TypeChecker
): TsoogleFunction {
  const parameters = getParameters(signature, checker);
  const returnType = getReturnType(signature, checker);
  const typeParameters = getTypeParameters(signature, checker);

  return {
    parameters,
    returnType,
    typeParameters,
  };
}

export function getFromClass(
  classSymbol: ts.Symbol,
  checker: ts.TypeChecker
): TsoogleFunction[] {
  if (!classSymbol.members) return [];

  const methods = Array.from(classSymbol.members.entries());

  return methods.flatMap(([name, methodSymbol]) => {
    const declarations = methodSymbol.declarations;

    if (
      !declarations ||
      !declarations.length ||
      !ts.isMethodDeclaration(declarations[0])
    ) {
      return [];
    }

    const methodDeclaration = declarations[0];

    const signature = checker.getSignatureFromDeclaration(methodDeclaration);
    assert(signature, "method must have a signature");

    const result = getFromSignature(signature, checker);
    return [{ ...result, name: `${classSymbol.getName()}#${name}` }];
  });
}

function getReturnType(
  signature: ts.Signature,
  checker: ts.TypeChecker
): string {
  const type = signature.getReturnType();

  const signatures = type.getCallSignatures();

  if (signatures.length > 0) {
    const tsoogle = getFromSignature(signatures[0], checker);
    return stringify(tsoogle);
  }

  return checker.typeToString(type);
}

function getParameters(
  signature: ts.Signature,
  checker: ts.TypeChecker
): string[] {
  return checker.getExpandedParameters(signature)[0].map((symbol) => {
    const type = checker.getTypeOfSymbol(symbol);
    return checker.typeToString(type);
  });
}

function getTypeParameters(signature: ts.Signature, checker: ts.TypeChecker) {
  const typeParams = signature.getTypeParameters();

  return (
    typeParams?.flatMap((param) => {
      const paramDeclaration = checker.typeParameterToDeclaration(
        param,
        undefined,
        ts.NodeBuilderFlags.None
      );
      const name = paramDeclaration?.name.text;
      if (!name) return [];
      return [name];
    }) ?? []
  );
}

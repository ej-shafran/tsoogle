import assert from "assert";
import ts from "typescript";
import { TsoogleFunction } from "./tsoogle-function";
import { stringify } from "./stringify";

function getFromTsImpl(
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

function getReturnType(
  signature: ts.Signature,
  checker: ts.TypeChecker
): string {
  const type = signature.getReturnType();

  const signatures = type.getCallSignatures();

  if (signatures.length > 0) {
    const tsoogle = getFromTsImpl(signatures[0], checker);
    return stringify(tsoogle);
  }

  return checker.typeToString(type);
}

function getParameters(
  signature: ts.Signature,
  checker: ts.TypeChecker
): string[] {
  return signature.parameters.map((param) => {
    const type = checker.getTypeOfSymbol(param);
    const signatures = type.getCallSignatures();

    if (signatures.length > 0) {
      const tsoogle = getFromTsImpl(signatures[0], checker);
      return stringify(tsoogle);
    }

    return checker.typeToString(type);
  });
}

function getTypeParameters(signature: ts.Signature, checker: ts.TypeChecker) {
  const typeParams = signature.getTypeParameters();

  return typeParams?.flatMap((param) => {
    const paramDeclaration = checker.typeParameterToDeclaration(
      param,
      undefined,
      ts.NodeBuilderFlags.None
    );
    const name = paramDeclaration?.name.escapedText;
    if (!name) return [];
    return [name];
  });
}

export function getFromTs(
  node: ts.FunctionLikeDeclaration,
  checker: ts.TypeChecker,
  defaultName?: string
): TsoogleFunction {
  const signature = checker.getSignatureFromDeclaration(node);
  assert(signature, "function has no signature");

  const name = node.name?.getText() ?? defaultName;

  const tsoogle = getFromTsImpl(signature, checker);

  return {
    ...tsoogle,
    name,
  };
}

import assert from "assert";
import ts from "typescript";

export type TsoogleSignature = {
  name?: string;
  typeParams: string | undefined;
  returnType: string;
  parameters: string[];
};

export function stringifyTsoogle(signature: TsoogleSignature, withName = true) {
  const withoutName = `${signature.typeParams ?? ""
    }(${signature.parameters.join(", ")}) => ${signature.returnType}`;

  if (!withName || !signature.name) {
    return withoutName;
  } else {
    return `${signature.name} :: ${withoutName}`;
  }
}

function getTsoogleImpl(signature: ts.Signature, checker: ts.TypeChecker): TsoogleSignature {
  const parameters = getParameters(signature, checker);
  const returnType = getReturnType(signature, checker);
  const typeParams = getTypeParams(signature, checker);

  return {
    parameters,
    returnType,
    typeParams,
  };
}

function getReturnType(
  signature: ts.Signature,
  checker: ts.TypeChecker
): string {
  const type = signature.getReturnType();

  const signatures = type.getCallSignatures();
  if (signatures.length > 0) {
    return stringifyTsoogle(getTsoogleImpl(signatures[0], checker));
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
      return stringifyTsoogle(getTsoogleImpl(signatures[0], checker));
    }

    return checker.typeToString(type);
  });
}

function getTypeParams(signature: ts.Signature, checker: ts.TypeChecker) {
  const typeParams = signature.getTypeParameters();

  if (!typeParams) return "";

  const typeParamString = typeParams
    .flatMap((param) => {
      const paramDeclaration = checker.typeParameterToDeclaration(
        param,
        undefined,
        ts.NodeBuilderFlags.None
      );
      const name = paramDeclaration?.name.escapedText;
      if (!name) return [];
      return [name];
    })
    .join(", ");

  return `<${typeParamString}>`;
}

export function getTsoogleSignature(
  node: ts.FunctionLikeDeclaration,
  checker: ts.TypeChecker,
  defaultName?: string
): TsoogleSignature {
  const signature = checker.getSignatureFromDeclaration(node);
  assert(signature, "function has no signature");

  const name = node.name?.getText() ?? defaultName;

  const typeParams = getTypeParams(signature, checker);
  const returnType = getReturnType(signature, checker);
  const parameters = getParameters(signature, checker);

  return {
    name,
    typeParams,
    returnType,
    parameters,
  };
}

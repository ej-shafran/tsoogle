import assert from "assert";
import ts from "typescript";

export type TsoogleSignature = {
  name: string | undefined;
  typeParams: string | undefined;
  returnType: string;
  parameters: string[];
};

function getTsoogleImpl(signature: ts.Signature, checker: ts.TypeChecker) {
  const parameters = getParameters(signature, checker);
  const returnType = getReturnType(signature, checker);

  return {
    parameters,
    returnType,
  };
}

function getReturnType(
  signature: ts.Signature,
  checker: ts.TypeChecker
): string {
  const type = signature.getReturnType();

  const signatures = type.getCallSignatures();
  if (signatures.length > 0) {
    const { parameters, returnType } = getTsoogleImpl(signatures[0], checker);
    return `(${parameters.join(", ")}) => ${returnType}`;
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
      const { parameters, returnType } = getTsoogleImpl(signatures[0], checker);
      return `(${parameters.join(", ")}) => ${returnType}`;
    }

    return checker.typeToString(type);
  });
}

function getTypeParams(signature: ts.Signature, checker: ts.TypeChecker) {
  const typeParams = signature.getTypeParameters()?.flatMap((param) => {
    const paramDeclaration = checker.typeParameterToDeclaration(
      param,
      undefined,
      ts.NodeBuilderFlags.None
    );
    const name = paramDeclaration?.name.escapedText;
    if (!name) return [];
    return [name];
  });
  let typeParamString = "";
  if (typeParams) typeParamString = `<${typeParams.join(", ")}>`;

  return typeParamString;
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

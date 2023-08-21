import assert from "assert";
import ts from "typescript";

export type TsoogleSignature = {
  name: string | undefined;
  typeParams: string | undefined;
  returnType: string;
  parameters: string[];
};

export function getTsoogleSignature(
  node: ts.FunctionLikeDeclaration,
  checker: ts.TypeChecker,
  defaultName?: string
): TsoogleSignature {
  const signature = checker.getSignatureFromDeclaration(node);
  assert(signature, "function has no signature");

  const name = node.name?.getText() ?? defaultName;
  const typeParams = signature.getTypeParameters()?.flatMap((param) => {
    const paramDeclaration = checker.typeParameterToDeclaration(
      param,
      node,
      ts.NodeBuilderFlags.None
    );
    const name = paramDeclaration?.name.escapedText;
    if (!name) return [];
    return [name];
  });
  let typeParamString = "";
  if (typeParams) typeParamString = `<${typeParams.join(", ")}>`;

  // TODO remap returned functions to Tsoogle here
  const returnType = checker.typeToString(signature.getReturnType());
  // TODO remap function parameters to Tsoogle here
  const parameters = signature.parameters.map((symbol) =>
    checker.typeToString(checker.getTypeOfSymbol(symbol))
  );

  return {
    name,
    typeParams: typeParamString,
    returnType,
    parameters,
  };
}

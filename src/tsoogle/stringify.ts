import { TsoogleFunction } from "./tsoogle-function";

export type StringifyOptions = {
  excludeName?: boolean;
};

export function stringify(
  tsoogle: TsoogleFunction,
  options: StringifyOptions = {}
) {
  const typeParameters = tsoogle.typeParameters.length
    ? `<${tsoogle.typeParameters.join(", ")}>`
    : "";

  const parameters = tsoogle.parameters.join(", ");
  const returnType = tsoogle.returnType;

  const withoutName = `${typeParameters}(${parameters}) => ${returnType}`;

  if (options.excludeName || !tsoogle.name) {
    return withoutName;
  } else {
    return `${tsoogle.name} :: ${withoutName}`;
  }
}

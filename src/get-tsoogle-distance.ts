import { TsoogleSignature, stringifyTsoogle } from "./get-tsoogle-signature";
import { levDistance } from "./utils";

export function getDistance(signature: TsoogleSignature, search: string) {
  const type = stringifyTsoogle(signature, false);
  const typeDistance = levDistance(type, search) / type.length;

  const name = signature.name;
  if (!name) return typeDistance;
  const nameDistance = levDistance(name, search) / name.length;

  if (!search.includes("::")) return Math.min(typeDistance, nameDistance);

  const full = stringifyTsoogle(signature);
  const fullDistance = levDistance(full, search);

  return Math.min(typeDistance, nameDistance, fullDistance);
}

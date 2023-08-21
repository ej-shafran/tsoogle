import { TsoogleFunction } from "./tsoogle-function";
import { levDistance } from "../utils";
import { stringify } from "./stringify";

export function getDistance(signature: TsoogleFunction, search: string) {
  const type = stringify(signature, { excludeName: true });
  const typeDistance = levDistance(type, search) / type.length;

  const name = signature.name;
  if (!name) return typeDistance;
  const nameDistance = levDistance(name, search) / name.length;

  if (!search.includes("::")) return Math.min(typeDistance, nameDistance);

  const full = stringify(signature);
  const fullDistance = levDistance(full, search);

  return Math.min(typeDistance, nameDistance, fullDistance);
}

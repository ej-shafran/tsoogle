import { randomBytes } from "crypto";

function cached<TParams extends unknown[], TReturn>(
  func: (...params: TParams) => TReturn
): (...params: TParams) => TReturn {
  const cache = new Map<string, TReturn>();
  const sep = randomBytes(12).toString();

  return function(...args: TParams) {
    const hash = args
      .map((arg) => {
        switch (typeof arg) {
          case "string":
            return arg;
          case "object":
            return JSON.stringify(arg);
          case "function":
            return arg.toString();
          case "number":
            return arg.toString();
          default:
            return String(arg);
        }
      })
      .join(sep);

    if (cache.has(hash)) return cache.get(hash)!;

    const result = func(...args);
    cache.set(hash, result);
    return result;
  };
}

const levDistanceImpl = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  if (a[0] === b[0]) {
    return levDistance(a.slice(1), b.slice(1));
  }

  return (
    1 +
    Math.min(
      levDistance(a.slice(1), b),
      levDistance(a, b.slice(1)),
      levDistance(a.slice(1), b.slice(1))
    )
  );
};

export const levDistance = cached(levDistanceImpl);

import { randomBytes } from "crypto";
import { utilDebug } from "./debug";

const debug = utilDebug.extend("levDistance");

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

    if (cache.has(hash)) {
      const result = cache.get(hash)!;
      debug("cache hit");
      debug("cache result is %s (for %s)", String(result), args.join(" -> "));
      return result;
    }

    debug("cache miss");
    const result = func(...args);
    debug("manual result is %s (for %s)", String(result), args.join(" -> "));
    cache.set(hash, result);
    return result;
  };
}

function lev(a: string, b: string) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(a.length)
    .fill(0)
    .map((_, i) =>
      Array(b.length)
        .fill(0)
        .map((_, j) => i + j)
    );

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (a[i] === b[j]) {
        matrix[i][j] = i * j === 0 ? i + j : matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          1 +
          Math.min(
            i * j === 0 ? i + j : matrix[i - 1][j - 1],
            i === 0 ? j : matrix[i - 1][j],
            j === 0 ? i : matrix[i][j - 1]
          );
      }
    }
  }

  return matrix[a.length - 1][b.length - 1];
}

export const levDistance = cached(lev);

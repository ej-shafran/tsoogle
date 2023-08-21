import { levDistance } from "./lev-distance";
import { describe } from "vitest";
import { fc, it } from "@fast-check/vitest";

function hammingDistance(a: string, b: string) {
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (a[i] !== b[j]) result++;
    }
  }
  return result;
}

describe("Levenshtein Distance", () => {
  describe("bounds", () => {
    const prop = it.prop({
      a: fc.string(),
      b: fc.string(),
      c: fc.string(),
      equalSized: fc.nat({ max: 300 }).chain((length) => {
        const string = fc.string({ maxLength: length, minLength: length });
        return fc.tuple(string, string);
      }),
    });

    prop("should never differ by a negative value", ({ a, b }) => {
      return levDistance(a, b) >= 0;
    });

    prop("should differ by 0 for a string and itself *only*", ({ a, b }) => {
      return (levDistance(a, b) === 0) === (a === b);
    });

    prop("should differ at most by the length of the longer", ({ a, b }) => {
      return levDistance(a, b) <= Math.max(a.length, b.length);
    });

    prop(
      // see - https://en.wikipedia.org/wiki/Triangle_inequality
      "should maintain triangle inequality",
      ({ a, b, c }) => {
        return levDistance(a, b) <= levDistance(a, c) + levDistance(b, c);
      }
    );

    prop(
      // see - https://en.wikipedia.org/wiki/Hamming_distance
      "for equal sized strings - should not surpass the Hamming distance",
      ({ equalSized: [a, b] }) => {
        return levDistance(a, b) <= hammingDistance(a, b);
      }
    );
  });

  describe("tracking of changes", () => {
    const prop = it.prop({
      a: fc.string(),
      char: fc.char(),
      n: fc.nat({ max: 300 }),
    });

    prop(
      "should show a distance n for a string with n additions",
      ({ a, char, n }) => {
        const b = a + char.repeat(n);
        return levDistance(a, b) === n;
      }
    );

    prop(
      "should show a distance (<=n) for a string with (<=n) removals",
      ({ a, n }) => {
        const b = a.slice(n);
        return levDistance(a, b) <= n;
      }
    );
  });
});

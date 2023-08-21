#!/usr/bin/env node

// import ts from "typescript";
import { command, positional, run, string } from "cmd-ts";
import { levDistance } from "./lev-distance";
// import { ExistingPath } from "cmd-ts/batteries/fs";

const levApp = command({
  name: "lev-distance",
  args: {
    a: positional({ type: string }),
    b: positional({ type: string }),
  },
  handler({ a, b }) {
    const result = levDistance(a, b);
    console.log(
      `the Levenshtein Distance between \`${a}\` and \`${b}\` is ${result}`
    );
  },
});

// const app = command({
//   name: "tsoogle",
//   args: {
//     fileName: positional({ type: ExistingPath }),
//   },
//   async handler({ fileName }) {
//     const program = ts.createProgram({ rootNames: [fileName], options: {} });
//
//     console.log("fileName: ", fileName);
//   },
// });
//
run(levApp, process.argv.slice(2));

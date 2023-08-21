import { flag, number, option, optional, positional, string } from "cmd-ts";
import { ExistingPath } from "cmd-ts/batteries/fs";

import { ParsingInto, ArgParser } from "cmd-ts/dist/esm/argparser";
import { ProvidesHelp } from "cmd-ts/dist/esm/helpdoc";

type ArgTypes = Record<string, ArgParser<unknown> & Partial<ProvidesHelp>>;

export const args = {
  fileName: positional({
    type: ExistingPath,
    displayName: "entry",
    description: "Entry point to the TypeScript source code",
  }),
  checkDiagnostics: flag({
    long: "check-diagnostics",
    short: "c",
    description: "Whether to check for (and error on) TypeScript errors",
    defaultValue: () => false,
  }),
  search: option({
    type: optional(string),
    long: "search",
    short: "s",
    description: "The type siganture to search for",
  }),
  limit: option({
    type: number,
    long: "limit",
    short: "l",
    description: "The amount of results to show",
    defaultValue: () => 10,
  }),
} satisfies ArgTypes;

export type Args = Output<typeof args>;

type Output<Args extends ArgTypes> = {
  [key in keyof Args]: ParsingInto<Args[key]>;
};

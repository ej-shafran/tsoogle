#!/usr/bin/env node

import { command, run } from "cmd-ts";

import { name } from "./utils";
import { handler } from "./cli/handler";
import { args } from "./cli/args";

const app = command({
  name,
  args,
  handler,
});

run(app, process.argv.slice(2));

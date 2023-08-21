#!/usr/bin/env node

import { command, run } from "cmd-ts";

const app = command({
  name: "tsoogle",
  args: {},
  async handler() {
    console.log("Hello, world!");
  },
});

run(app, process.argv.slice(2));

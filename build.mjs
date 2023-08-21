import * as esbuild from "esbuild";

await esbuild.build({
  logLevel: "info",
  outdir: "./bin",
  entryPoints: ["./src/index.ts"],
  bundle: true,
  packages: "external",
  platform: "node",
});

#!/usr/bin/env node
import htmlPlugin from "@chialab/esbuild-plugin-html";
import esbuild from "esbuild";
import fs from "fs";

const outdir = "dist";
const copyPngPlugin = {
  name: "copy-png",
  setup(build) {
    const src = "static/img";
    const dest = `${outdir}/static/img`;

    build.onEnd(() =>
      fs.cpSync(src, dest, {
        recursive: true,
      }),
    );
  },
};

const buildArgs = {
  minify: true,
  bundle: true,
  outdir,
  entryPoints: ["static/index.html"],
  assetNames: "static/[name]-[hash]",
  chunkNames: "[ext]/[name]-[hash]",
  plugins: [htmlPlugin(), copyPngPlugin],
  loader: {
    ".png": "file",
  },
};

async function main() {
  const { argv } = process;
  const serve = argv.some((arg) => arg === "--serve");
  try {
    if (!serve) {
      await esbuild.build(buildArgs);
      console.log("Build successful");
      process.exit(0);
    }
    const ctx = await esbuild.context(buildArgs);
    const serveArgs = {
      host: "localhost",
      servedir: buildArgs.outdir,
      keyfile: argv.find((_, idx) => idx > 0 && argv[idx - 1] === "--keyfile"),
      certfile: argv.find((_, idx) => idx > 0 && argv[idx - 1] === "--certfile"),
    };
    const [_, serveResult] = await Promise.all([ctx.watch(), ctx.serve(serveArgs)]);
    console.log(`Serving on ${serveResult.host}:${serveResult.port}`);
  } catch (err) {
    console.error("Build error:\n", err);
    process.exit(1);
  }
}

main();

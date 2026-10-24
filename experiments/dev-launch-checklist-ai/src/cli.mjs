#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { runScan } from "./scanner.mjs";

function parseArgs(argv) {
  const args = {
    target: null,
    output: null,
    json: false,
    fixSuggestions: false,
  };

  const tokens = [...argv];
  while (tokens.length > 0) {
    const token = tokens.shift();

    if (!token) continue;
    if (!args.target && !token.startsWith("--")) {
      args.target = token;
      continue;
    }

    if (token === "--output") {
      const value = tokens.shift();
      if (!value) throw new Error("--output requires a path value.");
      args.output = value;
      continue;
    }

    if (token === "--json") {
      args.json = true;
      continue;
    }

    if (token === "--fix-suggestions") {
      args.fixSuggestions = true;
      continue;
    }

    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

function usage() {
  return [
    "dev-launch-checklist-ai <target> [--output <path>] [--fix-suggestions] [--json]",
    "",
    "Examples:",
    "  node ./src/cli.mjs /absolute/path/to/repo --fix-suggestions --output ./report.md",
    "  node ./src/cli.mjs /absolute/path/to/repo --json",
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.target) {
    console.log(usage());
    process.exit(args.help ? 0 : 1);
  }

  const report = await runScan(args.target, {
    fixSuggestions: args.fixSuggestions,
  });

  if (args.json) {
    const output = JSON.stringify(
      {
        target: report.target,
        generatedAt: report.generatedAt,
        summary: report.summary,
        results: report.results,
      },
      null,
      2,
    );

    if (args.output) {
      const absoluteOutput = path.resolve(args.output);
      await fs.mkdir(path.dirname(absoluteOutput), { recursive: true });
      await fs.writeFile(absoluteOutput, `${output}\n`, "utf8");
      console.log(`JSON report written to ${absoluteOutput}`);
      return;
    }

    console.log(output);
    return;
  }

  if (args.output) {
    const absoluteOutput = path.resolve(args.output);
    await fs.mkdir(path.dirname(absoluteOutput), { recursive: true });
    await fs.writeFile(absoluteOutput, `${report.markdown}\n`, "utf8");
    console.log(`Markdown report written to ${absoluteOutput}`);
    return;
  }

  console.log(report.markdown);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

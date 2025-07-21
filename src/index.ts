import { globSync, writeFileSync } from "node:fs";
import { getConfig } from "./config";
import { summarise } from "./summarise";

async function main() {
  const config = getConfig();

  const files = globSync(config.input);

  if (files.length === 0) {
    console.log("No files found matching the provided glob pattern.");
    return;
  }

  const output = files
    .map((filename) => {
      console.log(`Processing ${filename}...`);

      try {
        return summarise(filename);
      } catch (error) {
        console.error(`Failed to process ${filename}: ${error instanceof Error ? error : JSON.stringify(error)}`);
        return undefined;
      }
    })
    .filter(Boolean)
    .join("\n");

  console.log(`Writing summaries to ${config.output}.`);
  writeFileSync(config.output, output);
}

main().catch((error) => {
  console.error(error instanceof Error ? error : JSON.stringify(error));
  process.exit(1);
});

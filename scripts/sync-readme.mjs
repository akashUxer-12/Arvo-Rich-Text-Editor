import { mkdir, readFile, writeFile } from "node:fs/promises";

const source = new URL("../README.md", import.meta.url);
const outputDirectory = new URL("../src/generated/", import.meta.url);
const output = new URL("../src/generated/readmeContent.ts", import.meta.url);

const markdown = await readFile(source, "utf8");

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  output,
  `// Generated from README.md by scripts/sync-readme.mjs. Do not edit directly.\nexport const readmeContent = ${JSON.stringify(markdown)};\n`,
  "utf8",
);

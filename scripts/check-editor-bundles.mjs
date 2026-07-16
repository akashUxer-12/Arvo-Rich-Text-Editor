import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const directory = new URL("../dist/client/assets/", import.meta.url);
const files = await readdir(directory);

const budgets = [
  { prefix: "ArvoBasicEditor-", maximumGzipBytes: 10_000 },
  { prefix: "ArvoRichEditor-", maximumGzipBytes: 150_000 },
];

for (const budget of budgets) {
  const filename = files.find((file) => file.startsWith(budget.prefix) && file.endsWith(".js"));
  if (!filename) throw new Error(`Missing production chunk: ${budget.prefix}`);
  const bytes = gzipSync(await readFile(new URL(filename, directory))).byteLength;
  if (bytes > budget.maximumGzipBytes) {
    throw new Error(`${filename} is ${bytes} gzip bytes; budget is ${budget.maximumGzipBytes}`);
  }
  console.log(`${filename}: ${(bytes / 1024).toFixed(1)} KiB gzip`);
}

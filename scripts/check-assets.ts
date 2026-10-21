import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
interface Asset {
  file: string;
  bytes: number;
  status: "approved" | "review";
  reason: string;
}
export function checkAssets() {
  const root = "src/assets";
  const entries = JSON.parse(
    readFileSync(`${root}/manifest.json`, "utf8"),
  ) as Asset[];
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
    );
  const files = walk(root).filter((p) => /\.(jpg|jpeg|png|webp|gif)$/i.test(p));
  const paths = entries.map((e) => `${root}/${e.file}`);
  if (
    new Set(paths).size !== paths.length ||
    files.length !== paths.length ||
    files.some((f) => !paths.includes(f))
  )
    throw new Error("Image manifest must list every asset exactly once");
  const imports = readFileSync(`${root}/images.ts`, "utf8");
  const readme = readFileSync(`${root}/README.md`, "utf8");
  for (const entry of entries) {
    const bytes = statSync(`${root}/${entry.file}`).size;
    if (bytes > 200000 || bytes !== entry.bytes)
      throw new Error(`Image budget/manifest mismatch: ${entry.file}`);
    if (!readme.includes(entry.file))
      throw new Error(`Missing image documentation: ${entry.file}`);
    if (entry.status === "review" && imports.includes(`./${entry.file}`))
      throw new Error(`Review image must not be shipped: ${entry.file}`);
    if (entry.status === "approved" && !imports.includes(`./${entry.file}`))
      throw new Error(`Approved image is not mapped: ${entry.file}`);
  }
  if (/https?:\/\//.test(imports))
    throw new Error("External image URLs are forbidden");
  return {
    total: entries.length,
    approved: entries.filter((e) => e.status === "approved").length,
    review: entries.filter((e) => e.status === "review").length,
    maxBytes: Math.max(...entries.map((e) => e.bytes)),
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  console.log("Asset checks passed:", checkAssets());

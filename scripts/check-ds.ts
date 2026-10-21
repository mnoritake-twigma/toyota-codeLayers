import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { compile } from "tailwindcss";
export function inspectSource(path: string, source: string): string[] {
  if (path.startsWith("src/ds/tokens/")) return [];
  const errors: string[] = [];
  if (path.endsWith(".css") && !path.startsWith("src/ds/"))
    errors.push("DS外のCSS");
  if (/#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/i.test(source))
    errors.push("色コードの直書き");
  if (/--primitive-|\{primitive\./.test(source))
    errors.push("primitiveの直接参照");
  if (/\.[cm]?[jt]sx?$/.test(path)) {
    const file = ts.createSourceFile(
      path,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function visit(node: ts.Node) {
      if (ts.isJsxAttribute(node)) {
        const name = node.name.getText(file);
        if (name === "style")
          errors.push("インラインstyle（DSでは全指定を禁止）");
        if (name === "className" && node.initializer) {
          const inspect = (n: ts.Node) => {
            if (
              ts.isStringLiteralLike(n) ||
              ts.isTemplateHead(n) ||
              ts.isTemplateMiddle(n) ||
              ts.isTemplateTail(n)
            ) {
              if (/[\[\]]/.test(n.text))
                errors.push("任意値・任意variantクラス");
              if (
                /(?:^|\s|:)(?:bg|text|border|ring|shadow|fill|stroke)-(?:blue|red|green|slate|gray|zinc|neutral|stone|orange|amber|yellow|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d/.test(
                  n.text,
                )
              )
                errors.push("既定の色クラス");
            }
            ts.forEachChild(n, inspect);
          };
          inspect(node.initializer);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(file);
    // Helper functions / assigned class strings must not bypass JSX attribute inspection.
    const allStrings = (node: ts.Node) => {
      if (
        ts.isStringLiteralLike(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)
      )
        if (/(?:^|\s|:)(?:[\w-]+-\[[^\]]+\]|\[[^\]]+\]:)/.test(node.text))
          errors.push("ヘルパー内の任意値クラス");
      ts.forEachChild(node, allStrings);
    };
    allStrings(file);
  }
  return [...new Set(errors)];
}
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(`${dir}/${entry.name}`)
      : [`${dir}/${entry.name}`],
  );
}
export async function checkDefaultPalette() {
  const theme = readFileSync("src/ds/tokens/theme.css", "utf8");
  const engine = await compile(theme + "\n@tailwind utilities;");
  const forbidden = [
    "bg-blue-500",
    "p-4",
    "rounded-lg",
    "text-xl",
    "shadow-md",
  ];
  const css = engine.build([
    ...forbidden,
    "bg-text-primary",
    "p-md",
    "rounded-control",
    "text-body",
  ]);
  if (forbidden.some((c) => css.includes(`.${c} `)))
    throw new Error("既定のTailwindパレットが残っています");
  for (const c of ["bg-text-primary", "p-md", "rounded-control", "text-body"])
    if (!css.includes(`.${c} `))
      throw new Error(`semantic utilityが生成されません: ${c}`);
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const errors = files("src")
    .filter((p) => /\.(css|tsx?|jsx?)$/.test(p))
    .flatMap((p) =>
      inspectSource(p, readFileSync(p, "utf8")).map((e) => `${p}: ${e}`),
    );
  await checkDefaultPalette();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else
    console.log("DS rules passed; default Tailwind palettes are unavailable.");
}

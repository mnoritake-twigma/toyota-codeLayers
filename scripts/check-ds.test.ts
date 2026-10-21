import { it, expect } from "vitest";
import { inspectSource, checkDefaultPalette } from "./check-ds";
it("DSの禁止指定を検出し、配列アクセスや入力patternを誤検出しない", () => {
  for (const input of [
    '<p className="p-[13px]"/>',
    "<p className={`bg-[red]`}/>",
    'const classes="p-[13px]";',
    "<p style={{width:10}}/>",
    'const color="#abcdef";',
    'const x="rgb(0,0,0)";',
  ])
    expect(inspectSource("src/app/Example.tsx", input).length).toBeGreaterThan(
      0,
    );
  expect(
    inspectSource(
      "src/app/Example.tsx",
      'const x = rows[0]; const form=<input pattern="[0-9]{3}" className="text-body"/>;',
    ),
  ).toEqual([]);
  expect(inspectSource("src/app/extra.css", "p {}")).toContain("DS外のCSS");
  expect(
    inspectSource("src/ds/tokens/tokens.css", ":root {--color: #ffffff}"),
  ).toEqual([]);
});
it("Tailwindの既定paletteを除去しsemanticだけを生成", async () => {
  await expect(checkDefaultPalette()).resolves.toBeUndefined();
});

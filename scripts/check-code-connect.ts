import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

// Execute every published variant against a strict Figma property fixture, then
// typecheck the generated JSX against the real React component APIs.
const matrices: Record<string, Record<string, (string | number)[]>> = {
  Tag: { variant: ["bright", "weak", "dark"], size: ["sm", "lg"] },
  Button: {
    variant: ["primary", "secondary"],
    state: ["default", "disabled", "loading"],
  },
  TextButton: { variant: ["arrow-right", "chevron-left"] },
  SectionHeading: { required: ["true", "false"] },
  DescriptionListRow: { state: ["default"] },
  Stepper: { step: [1, 2, 3, 4, 5] },
  StepItem: { state: ["complete", "current", "upcoming"] },
  VehicleTableHeader: { state: ["default"] },
  VehicleTableRow: { state: ["default", "selected"] },
  DealerCard: { open: ["false", "true"] },
};
const textProps: Record<string, string> = {
  children: '文言 "引用" & <例> {式}',
  label: "住所",
  value: "ひかり市（架空）",
  number: "2",
  grade: "星紡",
  body_color: "銀雫シルバー",
  interior_color: "砂音ベージュ",
  name: "LUMIÈRE 月白",
  address: "東京都 ひかり市（架空）",
  closed_days: "火曜日",
  business_hours: "10:00–18:00",
};
const root = process.cwd();
const imports = new Set<string>();
const snippets: string[] = [];
for (const [name, matrix] of Object.entries(matrices)) {
  const source = fs.readFileSync(
    `src/ds/code-connect/${name}.figma.ts`,
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const combinations = Object.entries(matrix).reduce<
    Record<string, string | number>[]
  >(
    (rows, [key, values]) =>
      rows.flatMap((row) => values.map((value) => ({ ...row, [key]: value }))),
    [{}],
  );
  for (const props of combinations) {
    const figma = {
      selectedInstance: {
        getString(key: string) {
          if (!(key in textProps))
            throw new Error(`${name}: unknown text prop ${key}`);
          return textProps[key];
        },
        getEnum(key: string, values: Record<string, unknown>) {
          for (const expected of matrix[key])
            if (!(String(expected) in values))
              throw new Error(`${name}: missing enum ${expected}`);
          return values[String(props[key])];
        },
        findText(key: string) {
          return { type: "TEXT", textContent: key };
        },
      },
      code(strings: TemplateStringsArray, ...values: unknown[]) {
        return strings.reduce(
          (out, part, i) =>
            out + part + (i < values.length ? String(values[i]) : ""),
          "",
        );
      },
    };
    const result = {
      exports: {} as { default?: { example: string; imports?: string[] } },
    };
    vm.runInNewContext(js, {
      exports: result.exports,
      require: (id: string) => {
        if (id !== "figma") throw new Error(`Unexpected module ${id}`);
        return figma;
      },
    });
    const template = result.exports.default;
    if (!template?.example || template.example.includes("[object Object]"))
      throw new Error(`${name}: invalid snippet`);
    for (const item of template.imports ?? []) imports.add(item);
    snippets.push(
      `const Example${snippets.length} = () => (${template.example});`,
    );
  }
}
const file = path.join(root, ".code-connect-validation.tsx");
const content = [
  ...imports,
  `import type { DealerResult, DealerVehicle } from './src/types';
declare const dealer: DealerResult;
declare const registeredVehicle: DealerVehicle;
declare const selectedVehicleId: string | undefined;
declare const onSelectVehicle: (vehicle: DealerVehicle) => void;
declare const onSelectDealerVehicle: (dealer: DealerResult, vehicle: DealerVehicle) => void;`,
  ...snippets,
].join("\n");
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const host = ts.createCompilerHost(parsed.options);
const originalGetSource = host.getSourceFile.bind(host);
host.getSourceFile = (name, version, onError, shouldCreateNew) =>
  name === file
    ? ts.createSourceFile(name, content, version, true, ts.ScriptKind.TSX)
    : originalGetSource(name, version, onError, shouldCreateNew);
const program = ts.createProgram([file], parsed.options, host);
const errors = ts.getPreEmitDiagnostics(program);
if (errors.length) {
  process.stderr.write(
    ts.formatDiagnosticsWithColorAndContext(errors, {
      getCanonicalFileName: (x) => x,
      getCurrentDirectory: () => root,
      getNewLine: () => "\n",
    }),
  );
  process.exit(1);
}
console.log(
  `Code Connect: ${Object.keys(matrices).length} templates / ${snippets.length} variants passed JSX typechecking.`,
);

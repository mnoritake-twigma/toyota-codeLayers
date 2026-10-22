// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=18-157
// source=src/components/VehicleTable.tsx
// component=VehicleTable
import figma from "figma";
const instance = figma.selectedInstance;
// The actual VehicleTable generates its header internally. This is a DataTable specimen.
instance.getEnum("state", { default: "default" });
const columns = JSON.stringify(
  ["グレード", "ボディカラー", "インテリアカラー"].map((name) => {
    const text = instance.findText(name);
    if (text.type !== "TEXT") throw new Error("Missing header text: " + name);
    return text.textContent;
  }),
);
export default {
  id: "lumiere-vehicle-table-header",
  example: figma.code`<DataTable caption="登録車両一覧" columns={${columns}} rows={[]} />`,
  imports: ['import { DataTable } from "./src/ds"'],
  metadata: { nestable: false },
};

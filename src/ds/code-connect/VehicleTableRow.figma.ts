// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=18-178
// source=src/components/VehicleTable.tsx
// component=VehicleTable
import figma from "figma";
const instance = figma.selectedInstance;
// Figma-only row; state maps to VehicleTable selectedId.
const state = instance.getEnum("state", {
  default: "default",
  selected: "selected",
});
const vehicle = {
  grade: instance.getString("grade"),
  body_color: instance.getString("body_color"),
  interior_color: instance.getString("interior_color"),
};
const data = JSON.stringify(vehicle);
export default {
  id: "lumiere-vehicle-table-row",
  example: figma.code`<VehicleTable vehicles={[{ ...registeredVehicle, ...${data} }]} selectedId={${state === "selected" ? "registeredVehicle.id" : "undefined"}} onSelect={onSelectVehicle} />`,
  imports: ['import { VehicleTable } from "./src/components/VehicleTable"'],
  metadata: { nestable: true, props: { vehicle } },
};

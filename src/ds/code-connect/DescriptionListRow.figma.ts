// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=17-49
// source=src/ds/components/Layout.tsx
// component=DescriptionList
import figma from "figma";
const instance = figma.selectedInstance;
// Figma-only row structure; the public React API takes an items array.
const items = JSON.stringify([
  { label: instance.getString("label"), value: instance.getString("value") },
]);
instance.getEnum("state", { default: "default" });
export default {
  id: "lumiere-description-list-row",
  example: figma.code`<DescriptionList items={${items}} />`,
  imports: ['import { DescriptionList } from "./src/ds"'],
  metadata: { nestable: true },
};

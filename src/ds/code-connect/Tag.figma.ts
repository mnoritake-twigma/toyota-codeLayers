// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=17-14
// source=src/ds/components/Controls.tsx
// component=Tag
import figma from "figma";
const instance = figma.selectedInstance;
const label = JSON.stringify(instance.getString("children"));
const variant = instance.getEnum("variant", {
  bright: "bright",
  weak: "weak",
  dark: "dark",
});
const size = instance.getEnum("size", { sm: "sm", lg: "lg" });
export default {
  id: "lumiere-tag",
  example: figma.code`<Tag variant="${variant}" size="${size}">{${label}}</Tag>`,
  imports: ['import { Tag } from "./src/ds"'],
  metadata: { nestable: true },
};

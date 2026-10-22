// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=17-34
// source=src/ds/components/Controls.tsx
// component=TextButton
import figma from "figma";
const instance = figma.selectedInstance;
const label = JSON.stringify(instance.getString("children"));
const variant = instance.getEnum("variant", {
  "arrow-right": "arrow-right",
  "chevron-left": "chevron-left",
});
export default {
  id: "lumiere-text-button",
  example: figma.code`<TextButton variant="${variant}">{${label}}</TextButton>`,
  imports: ['import { TextButton } from "./src/ds"'],
  metadata: { nestable: true },
};

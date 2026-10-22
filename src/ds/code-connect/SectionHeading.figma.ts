// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=17-45
// source=src/ds/components/Layout.tsx
// component=SectionHeading
import figma from "figma";
const instance = figma.selectedInstance;
const label = JSON.stringify(instance.getString("children"));
const required = instance.getEnum("required", { true: true, false: false });
// The required Tag is rendered internally by SectionHeading; it is not a slot.
export default {
  id: "lumiere-section-heading",
  example: figma.code`<SectionHeading ${required ? "required" : ""}>{${label}}</SectionHeading>`,
  imports: ['import { SectionHeading } from "./src/ds"'],
  metadata: { nestable: true },
};

// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=17-29
// source=src/ds/components/Controls.tsx
// component=Button
import figma from "figma";
const instance = figma.selectedInstance;
const label = JSON.stringify(instance.getString("children"));
const variant = instance.getEnum("variant", {
  primary: "primary",
  secondary: "secondary",
});
const state = instance.getEnum("state", {
  default: "default",
  disabled: "disabled",
  loading: "loading",
});
export default {
  id: "lumiere-button",
  example: figma.code`<Button variant="${variant}" ${state === "disabled" ? "disabled" : ""} ${state === "loading" ? "loading" : ""}>{${label}}</Button>`,
  imports: ['import { Button } from "./src/ds"'],
  metadata: { nestable: true },
};

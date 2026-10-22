// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=18-147
// source=src/ds/components/Layout.tsx
// component=Stepper
import figma from "figma";
const instance = figma.selectedInstance;
const step = instance.getEnum("step", {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
});
// StepItem labels and states are generated internally; Stepper has no children prop.
export default {
  id: "lumiere-stepper",
  example: figma.code`<Stepper step={${step}} />`,
  imports: ['import { Stepper } from "./src/ds"'],
  metadata: { nestable: true },
};

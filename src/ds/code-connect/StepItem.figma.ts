// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=18-41
// source=src/ds/components/Layout.tsx
// component=Stepper
import figma from "figma";
const instance = figma.selectedInstance;
// Internal Stepper markup only. Use <Stepper step={n} /> for a complete navigation.
const state = instance.getEnum("state", {
  complete: "complete",
  current: "current",
  upcoming: "upcoming",
});
const label = JSON.stringify(instance.getString("label"));
const number = JSON.stringify(
  state === "complete" ? "✓" : instance.getString("number"),
);
const status = JSON.stringify(
  state === "complete" ? "完了" : state === "current" ? "現在" : "未到達",
);
export default {
  id: "lumiere-step-item",
  example: figma.code`<nav className="ds-stepper"><ol><li ${state === "current" ? 'aria-current="step"' : ""}><span className="ds-step-circle ${state !== "upcoming" ? "ds-step-reached" : ""}" aria-hidden="true">{${number}}</span><span>{${label}}</span><span className="ds-sr-only">{${status}}</span></li></ol></nav>`,
  metadata: { nestable: false },
};

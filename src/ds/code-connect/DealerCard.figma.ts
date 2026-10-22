// url=https://www.figma.com/design/6SrfjThMXeIG9a1bIiLM5M/CodeLayers?node-id=18-248
// source=src/components/DealerCard.tsx
// component=DealerCard
import figma from "figma";
const instance = figma.selectedInstance;
// IDs, phone, model and selection handlers must come from the application, never Figma.
const display = JSON.stringify({
  name: instance.getString("name"),
  address: instance.getString("address"),
  closed_days: instance.getString("closed_days"),
  business_hours: instance.getString("business_hours"),
});
const open = instance.getEnum("open", { true: true, false: false });
// DealerCard owns its table and has no children/open props. Keep registered vehicles intact.
export default {
  id: "lumiere-dealer-card",
  example: figma.code`<DealerCard dealer={{ ...dealer, ...${display} }} selectedVehicleId={selectedVehicleId} onSelect={onSelectDealerVehicle} imageSrc="" />`,
  imports: ['import { DealerCard } from "./src/components/DealerCard"'],
  metadata: { nestable: false, props: { previewOpen: open } },
};

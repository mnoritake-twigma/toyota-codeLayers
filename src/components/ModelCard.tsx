import { Placeholder, RadioCard } from "../ds";
import type { Model } from "../types";
export function ModelCard({
  model,
  selected,
  onSelect,
}: {
  model: Model;
  selected: boolean;
  onSelect: (model: Model) => void;
}) {
  return (
    <RadioCard
      name="model"
      value={model.code}
      selected={selected}
      onSelect={() => onSelect(model)}
    >
      <Placeholder variant="model" label={`${model.name}のプレースホルダ`} />
      <span className="ds-hint">{model.category}</span>
      <span className="ds-subtitle">{model.name}</span>
      <span className="ds-hint">{model.tagline}</span>
    </RadioCard>
  );
}

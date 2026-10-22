import { AssetImage, RadioCard } from "../ds";
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
      variant="model"
      name="model"
      value={model.code}
      selected={selected}
      onSelect={() => onSelect(model)}
    >
      <AssetImage
        variant="model"
        src={model.photo_url ?? undefined}
        alt={`${model.name}：AI生成の架空車両イメージ`}
      />
      <span className="ds-model-details">
        <span className="ds-hint">{model.category}</span>
        <span className="ds-subtitle">{model.name}</span>
        <span className="ds-hint">{model.tagline}</span>
      </span>
    </RadioCard>
  );
}

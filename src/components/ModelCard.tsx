import { modelImages } from "../data/images";
import type { Model } from "../types";
export function ModelCard({
  model,
  selected,
  onSelect,
  imageSrc = modelImages[model.code],
}: {
  imageSrc?: string;
  model: Model;
  selected: boolean;
  onSelect: (model: Model) => void;
}) {
  return (
    <label
      className={`block border cursor-pointer bg-white ${selected ? "border-ink" : "border-line"}`}
    >
      <div className="aspect-video bg-surface overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${model.name}の車両イメージ（AI生成）`}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted">
            {model.name}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <p className="text-xs text-muted">{model.category}</p>
            <h2 className="text-xl mt-1">{model.name}</h2>
          </div>
          <input
            aria-label={`${model.name}を選択`}
            className="w-auto"
            type="radio"
            name="model"
            checked={selected}
            onChange={() => onSelect(model)}
          />
        </div>
        <p className="text-xs text-muted mt-3">{model.tagline}</p>
      </div>
    </label>
  );
}

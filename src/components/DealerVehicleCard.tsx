import { AssetImage, RadioCard, Tag } from "../ds";
import type { DealerResult, DealerVehicle } from "../types";

export function DealerVehicleCard({
  dealer,
  modelPhotoUrl,
  selectedVehicleId,
  onSelect,
}: {
  dealer: DealerResult;
  modelPhotoUrl?: string;
  selectedVehicleId?: string;
  onSelect: (dealer: DealerResult, vehicle: DealerVehicle) => void;
}) {
  return (
    <article
      className="overflow-hidden rounded-tag border border-border-subtle bg-surface-default"
      aria-label={dealer.name}
    >
      <AssetImage
        variant="dealer-cover"
        src={dealer.photo_url ?? undefined}
        alt={`${dealer.name}：AI生成の架空店舗イメージ`}
      />
      <div className="p-md">
        <p className="ds-hint">店舗イメージ</p>
        <h3 className="text-body">{dealer.name}</h3>
        <p className="ds-hint">{dealer.address}</p>
        <p className="ds-hint">
          {dealer.business_hours}／定休日 {dealer.closed_days}
        </p>
      </div>
      {dealer.vehicles.map((vehicle) => {
        const selected = selectedVehicleId === vehicle.id;
        return (
          <RadioCard
            key={vehicle.id}
            name="test-drive-vehicle"
            value={vehicle.id}
            selected={selected}
            onSelect={() => onSelect(dealer, vehicle)}
          >
            <div className="flex flex-wrap items-start gap-sm">
              <div className="w-thumbnail-height shrink-0">
                <AssetImage
                  src={modelPhotoUrl}
                  alt="車種の参考画像（グレード・色は実車と異なります）"
                  variant="model"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-sm flex flex-wrap items-center gap-xs">
                  <Tag variant={selected ? "dark" : "weak"}>
                    {selected ? "選択中" : "試乗車"}
                  </Tag>
                  <p>{vehicle.grade}</p>
                </div>
                <p className="text-body-sm">ボディ：{vehicle.body_color}</p>
                <p className="text-body-sm">内装：{vehicle.interior_color}</p>
                <p className="ds-hint">車種の参考画像</p>
              </div>
            </div>
          </RadioCard>
        );
      })}
    </article>
  );
}

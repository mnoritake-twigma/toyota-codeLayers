import { useState } from "react";
import {
  Accordion,
  DescriptionList,
  AssetImage,
  RadioCard,
  Tag,
  TextButton,
} from "../ds";
import { dealerImageFor, modelImage } from "../assets/images";
import { VehicleTable } from "./VehicleTable";
import type { DealerResult, DealerVehicle } from "../types";
export function DealerCard({
  dealer,
  vehicle,
  variant = "accordion",
  selectedVehicleId,
  onSelect,
  imageSrc = dealerImageFor(dealer.code),
}: {
  dealer: DealerResult;
  vehicle?: DealerVehicle;
  variant?: "accordion" | "vehicle";
  imageSrc?: string;
  selectedVehicleId?: string;
  onSelect: (dealer: DealerResult, vehicle: DealerVehicle) => void;
}) {
  const [details, setDetails] = useState(false);

  if (variant === "vehicle" && vehicle) {
    const selected = selectedVehicleId === vehicle.id;
    return (
      <article>
        <RadioCard
          name="test-drive-vehicle"
          value={vehicle.id}
          selected={selected}
          variant="model"
          onSelect={() => onSelect(dealer, vehicle)}
        >
          <AssetImage
            variant="dealer-cover"
            src={imageSrc}
            alt={`${dealer.name}：AI生成の架空販売店イメージ`}
          />
          <div className="ds-model-details">
            <p className="text-body">{dealer.name}</p>
            <p className="ds-hint">{dealer.address}</p>
            <p className="ds-hint">
              {dealer.business_hours}／定休日 {dealer.closed_days}
            </p>
            <div className="ds-dealer-summary">
              <div className="w-thumbnail-width shrink-0">
                <AssetImage
                  src={modelImage(vehicle.model_code)}
                  alt="AI生成の架空車両イメージ"
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
                <DescriptionList
                  items={[
                    { label: "ボディ", value: vehicle.body_color },
                    { label: "内装", value: vehicle.interior_color },
                  ]}
                />
              </div>
            </div>
          </div>
        </RadioCard>
      </article>
    );
  }

  return (
    <article>
      <Accordion
        title={dealer.name}
        summary={
          <div className="ds-dealer-summary">
            <AssetImage src={imageSrc} alt="AI生成の架空販売店イメージ" />
            <DescriptionList
              items={[
                { label: "住所", value: dealer.address },
                { label: "定休日", value: dealer.closed_days },
                { label: "営業時間", value: dealer.business_hours },
              ]}
            />
          </div>
        }
      >
        <VehicleTable
          vehicles={dealer.vehicles}
          selectedId={selectedVehicleId}
          onSelect={(v) => onSelect(dealer, v)}
        />
      </Accordion>
      <div className="ds-phone-card">
        <TextButton
          variant="chevron-left"
          aria-expanded={details}
          onClick={() => setDetails(!details)}
        >
          販売店詳細
        </TextButton>
        {details && (
          <DescriptionList
            items={[
              {
                label: "電話番号",
                value: <a href={`tel:${dealer.phone}`}>{dealer.phone}</a>,
              },
              { label: "郵便番号", value: dealer.postal_code },
              ...(dealer.distanceKm !== undefined
                ? [
                    {
                      label: "距離",
                      value: `約${dealer.distanceKm}km（代表地点から）`,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </div>
    </article>
  );
}

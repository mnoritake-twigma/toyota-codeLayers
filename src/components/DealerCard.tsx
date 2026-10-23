import { useState } from "react";
import {
  Accordion,
  DescriptionList,
  AssetImage,
  Tag,
  TextButton,
} from "../ds";
import { VehicleTable } from "./VehicleTable";
import type { DealerResult, DealerVehicle } from "../types";
export function DealerCard({
  dealer,
  variant = "accordion",
  selectedVehicleId,
  onSelect,
  imageSrc = dealer.photo_url ?? undefined,
}: {
  dealer: DealerResult;
  variant?: "accordion" | "vehicle-list";
  imageSrc?: string;
  selectedVehicleId?: string;
  onSelect: (dealer: DealerResult, vehicle: DealerVehicle) => void;
}) {
  const [details, setDetails] = useState(false);
  const selected = dealer.vehicles.some(
    (vehicle) => vehicle.id === selectedVehicleId,
  );

  return (
    <article>
      <Accordion
        title={
          <span className="ds-row">
            <span>{dealer.name}</span>
            {selected && <Tag>選択中</Tag>}
          </span>
        }
        summary={
          <div
            className={
              variant === "vehicle-list" ? "ds-stack" : "ds-dealer-summary"
            }
          >
            <AssetImage
              variant={
                variant === "vehicle-list" ? "dealer-cover" : "dealer"
              }
              src={imageSrc}
              alt={`${dealer.name}の販売店写真`}
            />
            <DescriptionList
              items={[
                { label: "住所", value: dealer.address },
                { label: "定休日", value: dealer.closed_days },
                { label: "営業時間", value: dealer.business_hours },
              ]}
            />
          </div>
        }
        defaultOpen={variant === "vehicle-list"}
      >
        <VehicleTable
          vehicles={dealer.vehicles}
          selectedId={selectedVehicleId}
          onSelect={(v) => onSelect(dealer, v)}
        />
      </Accordion>
      {variant === "accordion" && (
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
      )}
    </article>
  );
}

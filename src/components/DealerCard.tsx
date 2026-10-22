import { useState } from "react";
import { Accordion, DescriptionList, AssetImage, TextButton } from "../ds";
import { VehicleTable } from "./VehicleTable";
import type { DealerResult, DealerVehicle } from "../types";
export function DealerCard({
  dealer,
  selectedVehicleId,
  onSelect,
  imageSrc = dealer.photo_url ?? undefined,
}: {
  dealer: DealerResult;
  imageSrc?: string;
  selectedVehicleId?: string;
  onSelect: (dealer: DealerResult, vehicle: DealerVehicle) => void;
}) {
  const [details, setDetails] = useState(false);
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

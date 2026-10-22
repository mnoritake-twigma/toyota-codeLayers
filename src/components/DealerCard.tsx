import {
  AssetImage,
  DescriptionList,
  RadioControl,
  TextButton,
} from "../ds";
import { VehicleTable } from "./VehicleTable";
import type { DealerResult, DealerVehicle } from "../types";
export function DealerCard({
  dealer,
  vehicle,
  distanceKm,
  selected,
  onSelect,
}: {
  dealer: DealerResult;
  vehicle: DealerVehicle;
  distanceKm: number;
  selected: boolean;
  onSelect: (dealer: DealerResult, vehicle: DealerVehicle) => void;
}) {
  return (
    <article
      className={`ds-vehicle-card ${selected ? "ds-selected" : ""}`}
    >
      <div className="ds-dealer-card-store">
        <div className="ds-row">
          <div className="ds-dealer-card-title">
            <RadioControl
              name="vehicle"
              value={vehicle.id}
              checked={selected}
              onChange={() => onSelect(dealer, vehicle)}
              aria-label={`${dealer.name}の${vehicle.grade}を選択`}
            />
            <span>{dealer.name}</span>
          </div>
          <TextButton
            onClick={() => onSelect(dealer, vehicle)}
            aria-label={`${dealer.name}を選択して店舗詳細を確認`}
          >
            店舗詳細
          </TextButton>
        </div>
        <DescriptionList
          items={[
            { label: "住所", value: dealer.address },
            { label: "営業時間", value: dealer.business_hours },
          ]}
        />
      </div>
      <div className="ds-dealer-card-image">
        <AssetImage
          variant="dealer-card"
          src="/assets/dealer-card-image.jpeg"
          alt="AI生成の架空販売店イメージ"
        />
        <span className="ds-hint">店舗イメージ（仮）</span>
      </div>
      <VehicleTable vehicle={vehicle} distanceKm={distanceKm} />
    </article>
  );
}

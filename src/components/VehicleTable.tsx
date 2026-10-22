import { DescriptionList, Tag } from "../ds";
import type { DealerVehicle } from "../types";
export function VehicleTable({
  vehicle,
  distanceKm,
}: {
  vehicle: DealerVehicle;
  distanceKm: number;
}) {
  return (
    <div className="ds-stack">
      <div className="ds-row">
        <span className="ds-subtitle">{vehicle.grade}</span>
        <Tag variant="weak" size="lg">
          試乗車
        </Tag>
      </div>
      <DescriptionList
        items={[
          { label: "ボディカラー", value: vehicle.body_color },
          { label: "インテリア", value: vehicle.interior_color },
          {
            label: "参考距離",
            value: `約${distanceKm.toFixed(1)}km（東京都の代表地点から）`,
          },
        ]}
      />
    </div>
  );
}

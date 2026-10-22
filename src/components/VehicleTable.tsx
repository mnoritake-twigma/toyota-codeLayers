import { DataTable } from "../ds";
import type { DealerVehicle } from "../types";
export function VehicleTable({
  vehicles,
  selectedId,
  onSelect,
  name = "vehicle",
}: {
  vehicles: DealerVehicle[];
  selectedId?: string;
  onSelect: (vehicle: DealerVehicle) => void;
  name?: string;
}) {
  return (
    <DataTable
      caption="登録試乗車一覧"
      columns={["グレード", "ボディカラー", "インテリアカラー"]}
      rows={vehicles.map((v) => ({
        key: v.id,
        state: selectedId === v.id ? "selected" : "default",
        cells: [
          <label className="ds-vehicle-choice">
            <input
              type="radio"
              name={name}
              value={v.id}
              checked={selectedId === v.id}
              onChange={() => onSelect(v)}
              aria-label={`${v.grade} ${v.body_color} ${v.interior_color}を選択`}
            />
            <span>{v.grade}</span>
          </label>,
          v.body_color,
          v.interior_color,
        ],
      }))}
    />
  );
}

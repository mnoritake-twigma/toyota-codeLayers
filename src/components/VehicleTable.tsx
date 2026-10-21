import { DataTable, Tag } from "../ds";
import type { DealerVehicle } from "../types";
export function VehicleTable({
  vehicles,
  selectedId,
  onSelect,
}: {
  vehicles: DealerVehicle[];
  selectedId?: string;
  onSelect: (vehicle: DealerVehicle) => void;
}) {
  return (
    <DataTable
      caption="登録車両一覧"
      columns={["選択", "種別", "グレード", "外装色 / 内装色"]}
      rows={vehicles.map((v) => ({
        key: v.id,
        cells: [
          v.kind === "test_drive" ? (
            <input
              type="radio"
              name="vehicle"
              value={v.id}
              checked={selectedId === v.id}
              onChange={() => onSelect(v)}
              aria-label={`${v.grade} ${v.body_color} ${v.interior_color}を選択`}
            />
          ) : (
            <span>—</span>
          ),
          <Tag variant={v.kind === "test_drive" ? "bright" : "weak"}>
            {v.kind === "test_drive" ? "試乗車" : "展示車"}
          </Tag>,
          v.grade,
          <>
            {v.body_color}
            <br />
            {v.interior_color}
          </>,
        ],
      }))}
    />
  );
}

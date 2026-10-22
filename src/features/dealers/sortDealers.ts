import type { DealerResult, DealerVehicle } from "../../types";

export interface DealerVehicleChoice {
  dealer: DealerResult;
  vehicle: DealerVehicle;
}

export interface DealerVehicleFilters {
  grade?: string;
  bodyColor?: string;
}

export function filterDealerVehicles(
  dealers: readonly DealerResult[],
  filters: DealerVehicleFilters = {},
): DealerVehicleChoice[] {
  return dealers.flatMap((dealer) =>
    dealer.vehicles
      .filter(
        (vehicle) =>
          (!filters.grade || vehicle.grade === filters.grade) &&
          (!filters.bodyColor || vehicle.body_color === filters.bodyColor),
      )
      .map((vehicle) => ({ dealer, vehicle })),
  );
}

export function vehicleFilterOptions(dealers: readonly DealerResult[]) {
  const vehicles = dealers.flatMap((dealer) => dealer.vehicles);
  const unique = (values: string[]) => [...new Set(values)].sort();
  return {
    grades: unique(vehicles.map((vehicle) => vehicle.grade)),
    bodyColors: unique(vehicles.map((vehicle) => vehicle.body_color)),
  };
}

// 再取得で候補が変わっても、見えない絞り込み条件を残さない。
export function normalizeVehicleFilters(
  dealers: readonly DealerResult[],
  filters: DealerVehicleFilters,
): Required<DealerVehicleFilters> {
  const { grades, bodyColors } = vehicleFilterOptions(dealers);
  return {
    grade: grades.includes(filters.grade ?? "") ? filters.grade! : "",
    bodyColor: bodyColors.includes(filters.bodyColor ?? "")
      ? filters.bodyColor!
      : "",
  };
}

// 表示中の車両だけを店舗単位にまとめる。元のAPI応答は変更しない。
export function groupVehicleChoices(choices: readonly DealerVehicleChoice[]) {
  const groups = new Map<string, DealerResult>();
  for (const { dealer, vehicle } of choices) {
    if (!groups.has(dealer.id))
      groups.set(dealer.id, { ...dealer, vehicles: [] });
    groups.get(dealer.id)!.vehicles.push(vehicle);
  }
  return [...groups.values()];
}

// 都道府県・郵便番号とも店舗コード順。登録有無による優先なし。
export function sortDealers(dealers: readonly DealerResult[]): DealerResult[] {
  return [...dealers].sort((a, b) => a.code.localeCompare(b.code));
}
// 登録有無では絞り込まない。セッションで差し替えるための純関数。
export function filterDealers(
  dealers: readonly DealerResult[],
): DealerResult[] {
  return [...dealers];
}

export {
  nearbyDealers,
  SEARCH_RADIUS_KM,
} from "../../../supabase/functions/_shared/search";

// 各グループ内の既存順序は変えず、車両未登録店だけ電話案内へ分離します。
export function groupDealers(dealers: readonly DealerResult[]) {
  return {
    registered: dealers.filter((d) => d.vehicles.length > 0),
    telephone: dealers.filter((d) => d.vehicles.length === 0),
  };
}

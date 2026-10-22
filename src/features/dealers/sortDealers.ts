import type { DealerResult, DealerVehicle } from "../../types";

export type DealerArea = "月白町" | "朝凪町" | "星見町" | "町名未記載";

export interface DealerVehicleChoice {
  dealer: DealerResult;
  vehicle: DealerVehicle;
}

export interface DealerVehicleFilters {
  area?: DealerArea | "";
  grade?: string;
  bodyColor?: string;
}

const dealerAreas: DealerArea[] = [
  "月白町",
  "朝凪町",
  "星見町",
  "町名未記載",
];

export function getDealerArea(address: string): DealerArea {
  return (
    dealerAreas.find(
      (area) => area !== "町名未記載" && address.includes(area),
    ) ?? "町名未記載"
  );
}

export function filterDealerVehicles(
  dealers: readonly DealerResult[],
  filters: DealerVehicleFilters = {},
): DealerVehicleChoice[] {
  return dealers.flatMap((dealer) =>
    dealer.vehicles
      .filter(
        (vehicle) =>
          (!filters.area || getDealerArea(dealer.address) === filters.area) &&
          (!filters.grade || vehicle.grade === filters.grade) &&
          (!filters.bodyColor || vehicle.body_color === filters.bodyColor),
      )
      .map((vehicle) => ({ dealer, vehicle })),
  );
}

export function countDealerVehiclesByArea(
  dealers: readonly DealerResult[],
  filters: Omit<DealerVehicleFilters, "area"> = {},
) {
  const choices = filterDealerVehicles(dealers, filters);
  return dealerAreas.map((area) => ({
    area,
    count: choices.filter(
      ({ dealer }) => getDealerArea(dealer.address) === area,
    ).length,
  }));
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

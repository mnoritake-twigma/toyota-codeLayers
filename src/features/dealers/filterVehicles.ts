import type { DealerResult, DealerVehicle } from "../../types";
import { distanceKm } from "../../../supabase/functions/_shared/search";

export interface VehicleCardResult {
  dealer: DealerResult;
  vehicle: DealerVehicle;
  area: string;
  distanceKm: number;
}

export interface VehicleFilters {
  grade: string;
  bodyColor: string;
  area: string;
}

const TOKYO_DEMO_CENTER = { lat: 35.6812, lng: 139.7671 };

function areaFromAddress(address: string) {
  return address.match(/ひかり市([^0-9]+町)/)?.[1] ?? "その他";
}

export function buildVehicleCards(
  dealers: readonly DealerResult[],
): VehicleCardResult[] {
  return dealers.flatMap((dealer) =>
    dealer.vehicles.map((vehicle) => ({
      dealer,
      vehicle,
      area: areaFromAddress(dealer.address),
      // 仮データ: 現在地 API がないため、東京都の代表地点からの参考距離を計算。
      distanceKm: distanceKm(TOKYO_DEMO_CENTER, dealer),
    })),
  );
}

export function filterVehicleCards(
  cards: readonly VehicleCardResult[],
  filters: VehicleFilters,
) {
  return cards.filter(
    ({ vehicle, area }) =>
      (!filters.grade || vehicle.grade === filters.grade) &&
      (!filters.bodyColor || vehicle.body_color === filters.bodyColor) &&
      (!filters.area || area === filters.area),
  );
}

export function vehicleFilterOptions(cards: readonly VehicleCardResult[]) {
  const unique = (values: string[]) =>
    [...new Set(values)].sort((a, b) => a.localeCompare(b, "ja"));
  return {
    grades: unique(cards.map(({ vehicle }) => vehicle.grade)),
    bodyColors: unique(cards.map(({ vehicle }) => vehicle.body_color)),
    areas: unique(cards.map(({ area }) => area)),
  };
}

export function relaxationMessage(
  cards: readonly VehicleCardResult[],
  filters: VehicleFilters,
) {
  const candidates = [
    ["grade", "グレード"],
    ["bodyColor", "ボディカラー"],
    ["area", "エリア"],
  ] as const;
  const useful = candidates.filter(([key]) => {
    if (!filters[key]) return false;
    return filterVehicleCards(cards, { ...filters, [key]: "" }).length > 0;
  });
  if (useful.length === 0)
    return "複数の条件を外すと、試乗車が見つかる可能性があります。";
  return `${useful.map(([, label]) => `「${label}」`).join("または")}の条件を外すと、試乗車が見つかります。`;
}

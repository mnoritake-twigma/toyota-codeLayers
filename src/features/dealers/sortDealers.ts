import type { DealerResult } from "../../types";
// 現行仕様：県検索はコード順、郵便番号検索は代表座標からの距離順。登録有無による優先なし。
export function sortDealers(
  dealers: readonly DealerResult[],
  mode: "prefecture" | "postal",
): DealerResult[] {
  return [...dealers].sort(
    (a, b) =>
      (mode === "postal"
        ? (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
        : 0) || a.code.localeCompare(b.code),
  );
}
// 現行では絞り込まない。セッションで差し替えるための純関数。
export function filterDealers(
  dealers: readonly DealerResult[],
): DealerResult[] {
  return [...dealers];
}

import type { DealerResult } from "../../types";
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

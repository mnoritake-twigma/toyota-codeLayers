import { searchDealers } from "../../api/searchDealers";
import type { SearchInput } from "../../types";

// The API layer retains its demo fallback, but release searches must use live data.
export async function searchLiveDealers(
  input: SearchInput,
  signal?: AbortSignal,
  delay = 0
) {
  const result = await searchDealers(input, signal, delay);
  if (result.offline) {
    throw new Error(
      "販売店情報を取得できませんでした。通信状態をご確認のうえ、もう一度読み込んでください。"
    );
  }
  return result;
}

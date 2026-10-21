// このシステムで取れるのは店舗一覧と試乗車登録有無まで。
// 空き枠・仮押さえは販売店システム側にあり、API は存在しない。has_test_carのみ取得可能。
import dealers from "../data/seed/dealers.json";
import cars from "../data/seed/dealer_test_cars.json";
import centers from "../data/seed/postal_centers.json";
import {
  distanceKm,
  parseSearch,
} from "../../supabase/functions/_shared/search";
import { ApiError, callApi, isConfigured } from "./client";
import type { DealerResult, SearchInput } from "../types";
export interface SearchResult {
  dealers: DealerResult[];
  offline: boolean;
  warning?: string;
}
export function offlineSearch(input: SearchInput): DealerResult[] {
  const center = input.postalCode
    ? (centers as Record<string, { lat: number; lng: number }>)[
        input.postalCode.slice(0, 3)
      ]
    : undefined;
  if (input.postalCode && !center) return [];
  const registered = new Set(
    cars
      .filter((c) => c.model_code === input.modelCode)
      .map((c) => c.dealer_id),
  );
  return dealers
    .filter(
      (d) =>
        !input.prefectureCode || d.prefecture_code === input.prefectureCode,
    )
    .map((d) => ({
      ...d,
      hasTestCar: registered.has(d.id),
      ...(center ? { distanceKm: distanceKm(center, d) } : {}),
    }))
    .sort(
      (a, b) =>
        (a.distanceKm ?? 0) - (b.distanceKm ?? 0) ||
        a.code.localeCompare(b.code),
    );
}
export async function searchDealers(
  raw: SearchInput,
  signal?: AbortSignal,
  delay = 0,
): Promise<SearchResult> {
  const input = parseSearch(raw);
  try {
    const data = await callApi<{ dealers: DealerResult[] }>(
      "search-dealers",
      input,
      signal,
      delay,
    );
    if (
      !Array.isArray(data.dealers) ||
      !data.dealers.every(
        (d) =>
          typeof d.id === "string" &&
          typeof d.code === "string" &&
          typeof d.hasTestCar === "boolean",
      )
    )
      throw new Error("APIの応答形式が不正です。");
    return { ...data, offline: false };
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof ApiError && error.status && error.status < 500)
      throw error;
    return {
      dealers: offlineSearch(input),
      offline: true,
      warning: isConfigured()
        ? "APIエラー：販売店情報を取得できなかったため、オフラインデータで表示しています。"
        : "接続先が未設定のため、オフラインデータで表示しています。",
    };
  }
}

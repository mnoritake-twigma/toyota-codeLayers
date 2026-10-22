// 空き枠 API は存在しない。取れるのは店舗に登録された車両（試乗車・展示車）のみ。
// 登録情報は希望日時の空き状況・仮押さえ・予約確定を保証しません。
import dealers from "../data/seed/dealers.json";

import { parseSearch } from "../../supabase/functions/_shared/search";
import { ApiError, callApi, isConfigured } from "./client";
import type { DealerResult, DealerVehicle, SearchInput } from "../types";
export interface SearchResult {
  dealers: DealerResult[];
  offline: boolean;
  warning?: string;
}
export async function offlineSearch(
  input: SearchInput,
): Promise<DealerResult[]> {
  const cars = (await import("../data/seed/dealer_vehicles.json")).default;
  const rows = dealers
    .filter(
      (d) =>
        (!input.prefectureCode || d.prefecture_code === input.prefectureCode) &&
        (!input.postalCode ||
          d.postal_code === input.postalCode.replaceAll("-", "")),
    )
    .map((d) => {
      const vehicles = cars.filter(
        (c) => c.dealer_id === d.id && c.model_code === input.modelCode,
      ) as DealerVehicle[];
      return {
        ...d,
        vehicles,
        hasTestCar: vehicles.some((v) => v.kind === "test_drive"),
      };
    });
  return rows.sort((a, b) => a.code.localeCompare(b.code));
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
          typeof d.hasTestCar === "boolean" &&
          typeof d.closed_days === "string" &&
          Array.isArray(d.vehicles) &&
          d.vehicles.every(
            (v) =>
              typeof v.id === "string" &&
              v.dealer_id === d.id &&
              v.model_code === input.modelCode &&
              ["test_drive", "display"].includes(v.kind) &&
              [v.grade, v.body_color, v.interior_color].every(
                (x) => typeof x === "string",
              ),
          ),
      )
    )
      throw new Error("APIの応答形式が不正です。");
    return { ...data, offline: false };
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof ApiError && error.status && error.status < 500)
      throw error;
    return {
      dealers: await offlineSearch(input),
      offline: true,
      warning: isConfigured()
        ? "APIエラー：販売店情報を取得できなかったため、オフラインデータで表示しています。"
        : "接続先が未設定のため、オフラインデータで表示しています。",
    };
  }
}

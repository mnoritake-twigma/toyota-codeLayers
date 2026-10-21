import { describe, it, expect } from "vitest";
import { sortDealers, filterDealers } from "./sortDealers";
import { offlineSearch } from "../../api/searchDealers";
import models from "../../data/seed/models.json";
import dealers from "../../data/seed/dealers.json";
import prefs from "../../data/seed/prefectures.json";
describe("現行の店舗表示", () => {
  it("県検索はコード順で、未登録店を優先から外さず入力配列を変更しない", () => {
    const rows = offlineSearch({
      modelCode: "M01",
      prefectureCode: "13",
    }).reverse();
    const before = [...rows];
    expect(sortDealers(rows, "prefecture").map((d) => d.code)).toEqual(
      [...rows.map((d) => d.code)].sort(),
    );
    expect(rows).toEqual(before);
    expect(filterDealers(rows)).toEqual(rows);
    expect(filterDealers(rows)).not.toBe(rows);
  });
  it("郵便番号検索は距離順、同距離はコード順", () => {
    const rows = offlineSearch({
      modelCode: "M01",
      postalCode: "1000001",
    }).reverse();
    const sorted = sortDealers(rows, "postal");
    expect(
      sorted.every((d, i) => !i || sorted[i - 1].distanceKm! <= d.distanceKm!),
    ).toBe(true);
    const tied = rows.slice(0, 2).map((d) => ({ ...d, distanceKm: 1 }));
    expect(sortDealers(tied, "postal").map((d) => d.code)).toEqual(
      tied.map((d) => d.code).sort(),
    );
  });
  it("10モデル・47県・150店、東京24店、各モデル未登録率約3割", () => {
    expect(models).toHaveLength(10);
    expect(prefs).toHaveLength(47);
    expect(dealers).toHaveLength(150);
    for (const m of models) {
      const rows = offlineSearch({ modelCode: m.code, prefectureCode: "13" });
      expect(rows).toHaveLength(24);
      const ratio = rows.filter((d) => !d.hasTestCar).length / rows.length;
      expect(ratio).toBeGreaterThanOrEqual(0.25);
      expect(ratio).toBeLessThanOrEqual(0.375);
    }
  });
});

it("座標検索は境界の丸め前に絞り込み、入力を変更しない", async () => {
  const { nearbyDealers, distanceKm } =
    await import("../../../supabase/functions/_shared/search");
  const center = { lat: 35, lng: 139 };
  const point = { code: "A", lat: 35.27, lng: 139 };
  const distance = distanceKm(center, point);
  const rows = [point];
  expect(nearbyDealers(rows, center, distance - 0.001)).toEqual([]);
  expect(nearbyDealers(rows, center, distance)).toHaveLength(1);
  expect(rows).toEqual([point]);
});

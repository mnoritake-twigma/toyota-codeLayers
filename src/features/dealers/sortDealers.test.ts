import { describe, it, expect } from "vitest";
import {
  groupVehicleChoices,
  normalizeVehicleFilters,
  vehicleFilterOptions,
  filterDealerVehicles,
  filterDealers,
  sortDealers,
} from "./sortDealers";
import { offlineSearch } from "../../api/searchDealers";
import models from "../../data/seed/models.json";
import dealers from "../../data/seed/dealers.json";
import prefs from "../../data/seed/prefectures.json";
describe("現行の店舗表示", async () => {
  it("県検索はコード順で、未登録店を優先から外さず入力配列を変更しない", async () => {
    const rows = (
      await offlineSearch({
        modelCode: "M01",
        prefectureCode: "13",
      })
    ).reverse();
    const before = [...rows];
    expect(sortDealers(rows).map((d) => d.code)).toEqual(
      [...rows.map((d) => d.code)].sort(),
    );
    expect(rows).toEqual(before);
    expect(filterDealers(rows)).toEqual(rows);
    expect(filterDealers(rows)).not.toBe(rows);
  });
  it("郵便番号検索もコード順", async () => {
    const rows = (
      await offlineSearch({
        modelCode: "M01",
        postalCode: "1000001",
      })
    ).reverse();
    const sorted = sortDealers(rows);
    expect(
      sorted.every(
        (d, i) => !i || sorted[i - 1].code.localeCompare(d.code) <= 0,
      ),
    ).toBe(true);
    const tied = rows.slice(0, 2).map((d) => ({ ...d, distanceKm: 1 }));
    expect(sortDealers(tied).map((d) => d.code)).toEqual(
      tied.map((d) => d.code).sort(),
    );
  });
  it("10モデル・47県・157店、東京31店、登録なし1〜2割、グレード4種類と希少グレード", async () => {
    expect(models).toHaveLength(10);
    expect(prefs).toHaveLength(47);
    expect(dealers).toHaveLength(157);
    for (const m of models) {
      const rows = await offlineSearch({
        modelCode: m.code,
        prefectureCode: "13",
      });
      expect(rows).toHaveLength(31);
      const ratio =
        rows.filter((d) => d.vehicles.length === 0).length / rows.length;
      expect(rows.filter((d) => d.hasTestCar)).toHaveLength(26);
      expect(rows.every((d) => d.vehicles.length <= 2)).toBe(true);
      expect(rows.filter((d) => d.vehicles.length === 1)).toHaveLength(24);
      const byGrade = new Map<string, Set<string>>();
      for (const d of rows)
        for (const v of d.vehicles) {
          if (!byGrade.has(v.grade)) byGrade.set(v.grade, new Set());
          byGrade.get(v.grade)!.add(d.id);
          expect(v).not.toHaveProperty("kind");
        }
      expect(byGrade.size).toBe(4);
      expect(byGrade.get("月澄")?.size).toBe(3);
      expect(
        new Set(
          rows
            .filter((d) => d.vehicles.length === 1)
            .map((d) => d.vehicles[0].grade),
        ).size,
      ).toBe(4);
      expect(ratio).toBeGreaterThanOrEqual(0.1);
      expect(ratio).toBeLessThanOrEqual(0.2);
    }
  });
});

describe("早期版の試乗車絞り込み", () => {
  it("グレード・ボディカラーを組み合わせて非破壊で絞り込む", async () => {
    const rows = await offlineSearch({
      modelCode: "M01",
      prefectureCode: "13",
    });
    const before = structuredClone(rows);
    const target = rows.flatMap((d) => d.vehicles)[0];
    const choices = filterDealerVehicles(rows, {
      grade: target.grade,
      bodyColor: target.body_color,
    });
    expect(choices.length).toBeGreaterThan(0);
    expect(
      choices.every(
        ({ vehicle }) =>
          vehicle.grade === target.grade &&
          vehicle.body_color === target.body_color,
      ),
    ).toBe(true);
    expect(rows).toEqual(before);
  });

  it("表示対象だけを店舗IDでまとめ、同店の別車両を維持する", async () => {
    const rows = await offlineSearch({
      modelCode: "M01",
      prefectureCode: "13",
    });
    const before = structuredClone(rows);
    const groups = groupVehicleChoices(filterDealerVehicles(rows));
    expect(groups).toHaveLength(26);
    expect(groups.flatMap((d) => d.vehicles)).toHaveLength(28);
    const multi = rows.find((d) => d.vehicles.length === 2)!;
    expect(
      groups.find((d) => d.id === multi.id)?.vehicles.map((v) => v.id),
    ).toEqual(multi.vehicles.map((v) => v.id));
    const grade = multi.vehicles[1].grade;
    const filtered = groupVehicleChoices(filterDealerVehicles(rows, { grade }));
    expect(
      filtered.find((d) => d.id === multi.id)?.vehicles.map((v) => v.id),
    ).toEqual(multi.vehicles.filter((v) => v.grade === grade).map((v) => v.id));
    expect(rows).toEqual(before);
  });

  it("東京の月澄条件を愛知へ持ち越しても、実在しない条件を除去する", async () => {
    const rows = await offlineSearch({
      modelCode: "M01",
      prefectureCode: "23",
    });
    const filters = normalizeVehicleFilters(rows, {
      grade: "月澄",
      bodyColor: "銀雫シルバー",
    });
    expect(filters).toEqual({ grade: "", bodyColor: "銀雫シルバー" });
    expect(filterDealerVehicles(rows, filters).length).toBeGreaterThan(0);
    expect(
      normalizeVehicleFilters(rows, {
        grade: "光環",
        bodyColor: "存在しない色",
      }),
    ).toEqual({ grade: "光環", bodyColor: "" });
  });

  it("候補は応答内の車両からだけ作り、未登録店から値を補完しない", async () => {
    const rows = await offlineSearch({
      modelCode: "M01",
      prefectureCode: "13",
    });
    const options = vehicleFilterOptions(rows);
    expect(options.grades).toEqual(["光環", "星紡", "月澄", "静風"]);
    expect(options.bodyColors).toHaveLength(3);
    expect(
      vehicleFilterOptions(rows.map((d) => ({ ...d, vehicles: [] }))),
    ).toEqual({ grades: [], bodyColors: [] });
    expect(groupVehicleChoices([])).toEqual([]);
    expect(
      normalizeVehicleFilters([], { grade: "静風", bodyColor: "月霧ホワイト" }),
    ).toEqual({ grade: "", bodyColor: "" });
  });
});

it("座標検索は境界の丸め前に絞り込み、入力を変更しない", async () => {
  const { nearbyDealers, distanceKm } = await import(
    "../../../supabase/functions/_shared/search"
  );
  const center = { lat: 35, lng: 139 };
  const point = { code: "A", lat: 35.27, lng: 139 };
  const distance = distanceKm(center, point);
  const rows = [point];
  expect(nearbyDealers(rows, center, distance - 0.001)).toEqual([]);
  expect(nearbyDealers(rows, center, distance)).toHaveLength(1);
  expect(rows).toEqual([point]);
});

it("電話案内へ未登録店舗を分離し、各グループ内の並び順を維持", async () => {
  const { groupDealers } = await import("./sortDealers");
  const rows = await offlineSearch({ modelCode: "M01", prefectureCode: "13" });
  const before = structuredClone(rows);
  const groups = groupDealers(rows);
  expect(groups.telephone).toHaveLength(5);
  expect(groups.registered.every((d) => d.hasTestCar)).toBe(true);
  expect(groups.registered.every((d) => d.vehicles.length > 0)).toBe(true);
  expect(groups.registered.map((d) => d.code)).toEqual(
    groups.registered.map((d) => d.code).sort(),
  );
  expect(rows).toEqual(before);
});
it("全モデルで車両IDは一意、全国の登録なしは1〜2割、店舗ごと0〜2台", async () => {
  const ids = new Set<string>();
  for (const m of models) {
    const rows = await offlineSearch({ modelCode: m.code });
    for (const predicate of [
      (d: (typeof rows)[number]) => d.vehicles.length === 0,
    ]) {
      const ratio = rows.filter(predicate).length / rows.length;
      expect(ratio).toBeGreaterThanOrEqual(0.1);
      expect(ratio).toBeLessThanOrEqual(0.2);
    }
    expect(
      rows.every(
        (d) => d.vehicles.length <= 2 && d.hasTestCar === d.vehicles.length > 0,
      ),
    ).toBe(true);
    for (const d of rows)
      for (const v of d.vehicles) {
        expect(ids.has(v.id)).toBe(false);
        ids.add(v.id);
        expect(v.dealer_id).toBe(d.id);
        expect(v.model_code).toBe(m.code);
      }
  }
});

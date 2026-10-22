import { describe, expect, it } from "vitest";
import { offlineSearch } from "../../api/searchDealers";
import { vehicleResults } from "./vehicleResults";

const noFilters = { grade: "", bodyColor: "" };

describe("取得済み車両の絞り込み", () => {
  it("同一店舗の2台を別の車両として保持し、元の店舗順を変えない", async () => {
    const dealers = await offlineSearch({
      modelCode: "M01",
      prefectureCode: "13",
    });
    const before = structuredClone(dealers);
    const result = vehicleResults(dealers, noFilters);
    expect(result.filteredChoices).toHaveLength(28);
    expect(
      result.filteredChoices.filter(({ dealer }) => dealer.id === "13-011")
    ).toHaveLength(2);
    expect(
      new Set(result.filteredChoices.map(({ vehicle }) => vehicle.id)).size
    ).toBe(28);
    expect(dealers).toEqual(before);
  });

  it("東京の月澄条件を愛知へ持ち越しても、存在しない条件で0台にしない", async () => {
    const dealers = await offlineSearch({
      modelCode: "M01",
      prefectureCode: "23",
    });
    const result = vehicleResults(dealers, { grade: "月澄", bodyColor: "" });
    expect(result.filters).toEqual(noFilters);
    expect(result.grades).not.toContain("月澄");
    expect(result.filteredChoices).toHaveLength(13);
  });

  it("グレードと色は同じ1台に対してAND条件で絞り込む", async () => {
    const dealers = await offlineSearch({
      modelCode: "M01",
      prefectureCode: "13",
    });
    const result = vehicleResults(dealers, {
      grade: "光環",
      bodyColor: "夜凪ブラック",
    });
    expect(result.filteredChoices).toHaveLength(4);
    expect(
      result.filteredChoices.every(
        ({ vehicle }) =>
          vehicle.grade === "光環" && vehicle.body_color === "夜凪ブラック"
      )
    ).toBe(true);
  });

  it("取得された車両がなければ候補や台数を補わない", async () => {
    const dealers = await offlineSearch({
      modelCode: "M01",
      prefectureCode: "01",
    });
    const result = vehicleResults(dealers, {
      grade: "月澄",
      bodyColor: "夜凪ブラック",
    });
    expect(result.grades).toEqual([]);
    expect(result.bodyColors).toEqual([]);
    expect(result.filteredChoices).toEqual([]);
    expect(result.filters).toEqual(noFilters);
  });
});

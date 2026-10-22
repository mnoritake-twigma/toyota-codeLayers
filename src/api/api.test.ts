import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { searchDealers } from "./searchDealers";
import { submitRequest } from "./submitRequest";
import { config } from "../config";
const original = { ...config };
beforeEach(() => {
  config.supabaseUrl = "https://demo.example.com";
  config.supabaseAnonKey = "demo-public-anon";
});
afterEach(() => {
  Object.assign(config, original);
  vi.unstubAllGlobals();
});
const input = { modelCode: "M01", prefectureCode: "13" };
const request = {
  modelCode: "M01",
  dealerId: "13-011",
  vehicleId: "V-13-011-M01-1",
  name: "デモ 太郎",
  kana: "デモ タロウ",
  email: "demo@example.com",
  phone: "00000000000",
  preferred1: "2099-01-01T10:00:00+09:00",
  preferred2: "2099-01-02T11:00:00+09:00",
  notes: "",
};
describe("APIのフォールバックと申し込み", () => {
  it("未設定なら通信せず31件の代替データ", async () => {
    config.supabaseUrl = "";
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const result = await searchDealers(input);
    expect(result.offline).toBe(true);
    expect(result.dealers).toHaveLength(31);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("ネットワーク切断時にシードへフォールバック", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    expect((await searchDealers(input)).offline).toBe(true);
  });
  it("5xxと不正応答もシードへフォールバック", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('{"error":"error"}', { status: 502 }))
      .mockResolvedValueOnce(new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    expect((await searchDealers(input)).offline).toBe(true);
    expect((await searchDealers(input)).offline).toBe(true);
  });
  it("正常な0件は代替データで上書きしない", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response('{"dealers":[]}')),
    );
    expect(await searchDealers(input)).toEqual({ dealers: [], offline: false });
  });
  it("400は画面へエラーを返す", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response('{"error":"invalid"}', { status: 400 }),
        ),
    );
    await expect(searchDealers(input)).rejects.toThrow("invalid");
  });
  it("中断した古い検索を代替データとして復活させない", async () => {
    const abort = new AbortController();
    abort.abort();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")),
    );
    await expect(searchDealers(input, abort.signal)).rejects.toThrow("aborted");
  });
  it("郵便番号のハイフンを除去し、不一致は0件", async () => {
    config.supabaseUrl = "";
    expect(
      (await searchDealers({ modelCode: "M01", postalCode: "100-0001" }))
        .dealers,
    ).toHaveLength(1);
    expect(
      (await searchDealers({ modelCode: "M01", postalCode: "9990000" }))
        .dealers,
    ).toHaveLength(0);
  });
  it("無効な条件を代替検索に流さない", async () => {
    await expect(
      searchDealers({ modelCode: "M99", prefectureCode: "13" }),
    ).rejects.toThrow();
    await expect(
      searchDealers({ ...input, postalCode: "1000001" }),
    ).rejects.toThrow();
  });
  it("保存成功時だけ受付番号を返し、希望日時を送る", async () => {
    const receiptNumber = "LM-" + "A".repeat(32);
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ receiptNumber }), { status: 201 }),
      );
    vi.stubGlobal("fetch", fetch);
    expect(await submitRequest(request)).toEqual({ receiptNumber });
    expect(JSON.parse(fetch.mock.calls[0][1].body).preferred1).toBe(
      request.preferred1,
    );
  });
  it("送信失敗を成功扱いしない", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(submitRequest(request)).rejects.toThrow("offline");
  });
  it("同一希望日時・過去日・無効なカナを送信前に拒否", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(
      submitRequest({ ...request, preferred2: request.preferred1 }),
    ).rejects.toThrow();
    await expect(
      submitRequest({ ...request, preferred1: "2000-01-01T10:00:00+09:00" }),
    ).rejects.toThrow();
    await expect(submitRequest({ ...request, kana: "abc" })).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});

it("郵便番号は7桁完全一致で検索し、同じ先頭3桁でも結果が変わる", async () => {
  config.supabaseUrl = "";
  const tokyo = (
    await searchDealers({ modelCode: "M01", postalCode: "1000001" })
  ).dealers;
  const osaka = (
    await searchDealers({ modelCode: "M01", postalCode: "5300001" })
  ).dealers;
  expect(tokyo.length).toBeGreaterThan(0);
  expect(tokyo.length).toBeLessThan(150);
  expect(osaka.length).toBeGreaterThan(0);
  expect(osaka.length).toBeLessThan(150);
  expect(tokyo.every((d) => d.postal_code === "1000001")).toBe(true);
  const next = (
    await searchDealers({ modelCode: "M01", postalCode: "1000002" })
  ).dealers;
  expect(next).toHaveLength(1);
  expect(next[0].postal_code).toBe("1000002");
  expect(next[0].id).not.toBe(tokyo[0].id);
  expect(osaka.every((d) => d.postal_code === "5300001")).toBe(true);
  expect(osaka.map((d) => d.id)).not.toEqual(tokyo.map((d) => d.id));
  expect(tokyo.some((d) => d.prefecture_code === "27")).toBe(false);
});
it("47県の検索で別の都道府県を混ぜない", async () => {
  config.supabaseUrl = "";
  for (let i = 1; i <= 47; i++) {
    const code = String(i).padStart(2, "0");
    const rows = (
      await searchDealers({ modelCode: "M01", prefectureCode: code })
    ).dealers;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((d) => d.prefecture_code === code)).toBe(true);
    expect(rows.map((d) => d.code)).toEqual(rows.map((d) => d.code).sort());
  }
});

import { afterEach, expect, it, vi } from "vitest";
import { searchLiveDealers } from "./searchLiveDealers";

const input = { modelCode: "M01", prefectureCode: "13" };
afterEach(() => vi.unstubAllGlobals());

it("通信失敗時にAPI層がシードを返しても、リリース画面には渡さない", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
  await expect(searchLiveDealers(input)).rejects.toThrow(
    "販売店情報を取得できませんでした"
  );
});

it("502のフォールバックも表示しない", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response('{"error":"Backend error"}', { status: 502 })
      )
  );
  await expect(searchLiveDealers(input)).rejects.toThrow(
    "もう一度読み込んでください"
  );
});

it("APIが返す本当の0件はエラーにしない", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response('{"dealers":[]}'))
  );
  await expect(searchLiveDealers(input)).resolves.toEqual({
    dealers: [],
    offline: false,
  });
});

it("入力エラーは元のメッセージを維持する", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response('{"error":"県をご確認ください"}', { status: 400 })
      )
  );
  await expect(searchLiveDealers(input)).rejects.toThrow("県をご確認ください");
});

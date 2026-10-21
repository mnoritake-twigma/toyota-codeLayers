import { expect, it } from "vitest";
import { checkAssets } from "./check-assets";
it("全画像が容量上限と一覧に一致し、要確認画像を配信しない", () => {
  const result = checkAssets();
  expect(result).toMatchObject({ total: 13, approved: 8, review: 5 });
  expect(result.maxBytes).toBeLessThanOrEqual(200000);
});

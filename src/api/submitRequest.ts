// 空き枠 API は存在しない。取れるのは店舗に登録された車両（試乗車・展示車）のみ。
// 登録情報は希望日時の空き状況・仮押さえ・予約確定を保証しません。
import { callApi, ApiError } from "./client";
import { validateRequest } from "../../supabase/functions/_shared/validate";
import type { RequestInput } from "../types";
export async function submitRequest(
  input: RequestInput,
): Promise<{ receiptNumber: string }> {
  const error = validateRequest(input);
  if (error) throw new ApiError(error);
  // 送信失敗時は成功に見せず、個人情報をローカル保存もしません。
  const result = await callApi<{ receiptNumber: string }>(
    "submit-request",
    input,
  );
  if (!/^LM-[A-F0-9]{32}$/.test(result.receiptNumber))
    throw new ApiError(
      "受付番号を確認できませんでした。再送信の前に販売店へお問い合わせください。",
    );
  return result;
}

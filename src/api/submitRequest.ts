// このシステムで取れるのは店舗一覧と試乗車登録有無まで。
// 空き枠・仮押さえは販売店システム側にあり、API は存在しない。希望日時としてのみ送信します。
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

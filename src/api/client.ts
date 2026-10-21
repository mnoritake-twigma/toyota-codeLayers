// このシステムで取れるのは店舗一覧と試乗車登録有無まで。
// 空き枠・仮押さえは販売店システム側にあり、API は存在しない。
// has_test_car（UIではhasTestCar）は登録情報であり、その日時に乗れることを保証しません。
import { config } from "../config";
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}
export const isConfigured = () =>
  Boolean(config.supabaseUrl && config.supabaseAnonKey);
export async function callApi<T>(
  name: string,
  body: unknown,
  signal?: AbortSignal,
  delay = 0,
): Promise<T> {
  if (!isConfigured()) throw new ApiError("接続先が未設定です。");
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(
      `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/${name}${delay ? `?delay=${Math.min(3000, Math.max(0, delay))}` : ""}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${config.supabaseAnonKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(
        data.error || "APIに接続できませんでした。",
        response.status,
      );
    return data as T;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

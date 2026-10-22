// 空き枠 API は存在しない。取れるのは店舗に登録された車両（試乗車・展示車）のみ。
// 登録情報は希望日時の空き状況・仮押さえ・予約確定を保証しません。
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
          // Publishable keys are not JWTs; send them only in apikey.
          ...(config.supabaseAnonKey.startsWith("sb_publishable_")
            ? {}
            : { Authorization: `Bearer ${config.supabaseAnonKey}` }),
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

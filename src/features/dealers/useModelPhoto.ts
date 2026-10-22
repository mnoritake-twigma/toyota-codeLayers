import { useEffect, useState } from "react";
import { config } from "../../config";

// 写真を取得できない場合は未設定とし、同梱データへの置き換えはしない。
export function useModelPhoto(modelCode: string) {
  const [photo, setPhoto] = useState<{ code: string; url?: string }>();
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const load = async () => {
      try {
        const response = await fetch(
          `${config.supabaseUrl.replace(
            /\/$/,
            "",
          )}/rest/v1/models?select=code,photo_url&code=eq.${encodeURIComponent(
            modelCode,
          )}`,
          {
            headers: {
              apikey: config.supabaseAnonKey,
              ...(config.supabaseAnonKey.startsWith("sb_publishable_")
                ? {}
                : { Authorization: `Bearer ${config.supabaseAnonKey}` }),
            },
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("Model photo unavailable");
        const rows: unknown = await response.json();
        const model = Array.isArray(rows)
          ? rows.find((row) => row?.code === modelCode)
          : undefined;
        if (!controller.signal.aborted)
          setPhoto({
            code: modelCode,
            url:
              typeof model?.photo_url === "string"
                ? model.photo_url
                : undefined,
          });
      } catch {
        if (!controller.signal.aborted) setPhoto({ code: modelCode });
      } finally {
        clearTimeout(timeout);
      }
    };
    void load();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [modelCode]);
  return photo?.code === modelCode ? photo.url : undefined;
}

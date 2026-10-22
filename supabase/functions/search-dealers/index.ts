import { cors, json, rest } from "../_shared/http.ts";
import { parseSearch } from "../_shared/search.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let input;
  try {
    input = parseSearch(await req.json());
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
  const delay = Number(new URL(req.url).searchParams.get("delay") ?? 0);
  if (Number.isFinite(delay) && delay > 0)
    await new Promise((r) => setTimeout(r, Math.min(delay, 3000)));
  try {
    const response = await rest(
      `dealers?select=*,dealer_vehicles(*)&order=code.asc${input.prefectureCode ? `&prefecture_code=eq.${input.prefectureCode}` : `&postal_code=eq.${input.postalCode}`}`,
    );
    if (!response.ok) throw new Error("Backend error");
    const rows = await response.json();
    const dealers = rows.map(
      (
        row: Record<string, unknown> & {
          code: string;
          lat: number;
          lng: number;
          dealer_vehicles: {
            id: string;
            model_code: string;
            grade: string;
            body_color: string;
            interior_color: string;
          }[];
        },
      ) => {
        const { dealer_vehicles, ...dealer } = row;
        const vehicles = dealer_vehicles.filter(
          (c) => c.model_code === input.modelCode,
        );
        return {
          ...dealer,
          vehicles,
          hasTestCar: vehicles.length > 0,
        };
      },
    );
    return json({ dealers: dealers });
  } catch {
    return json({ error: "販売店情報を取得できませんでした。" }, 502);
  }
});

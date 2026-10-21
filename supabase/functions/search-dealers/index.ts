import { cors, json, rest } from "../_shared/http.ts";
import { nearbyDealers, parseSearch } from "../_shared/search.ts";
import centers from "../_shared/postal-centers.json" with { type: "json" };
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
    const center = input.postalCode
      ? (centers as Record<string, { lat: number; lng: number }>)[
          input.postalCode.slice(0, 3)
        ]
      : undefined;
    if (input.postalCode && !center) return json({ dealers: [] });
    const response = await rest(
      `dealers?select=*,dealer_vehicles(*)&order=code.asc${input.prefectureCode ? `&prefecture_code=eq.${input.prefectureCode}` : ""}`,
    );
    if (!response.ok) throw new Error("Backend error");
    const rows = await response.json();
    const dealers = rows.map(
      (
        row: Record<string, unknown> & {
          code: string;
          lat: number;
          lng: number;
          dealer_vehicles: { id: string; model_code: string; kind: string }[];
        },
      ) => {
        const { dealer_vehicles, ...dealer } = row;
        const vehicles = dealer_vehicles.filter(c => c.model_code === input.modelCode);
        return {
          ...dealer,
          vehicles,
          hasTestCar: vehicles.some(c => c.kind === "test_drive"),
        };
      },
    );
    return json({ dealers: center ? nearbyDealers(dealers, center) : dealers });
  } catch {
    return json({ error: "販売店情報を取得できませんでした。" }, 502);
  }
});

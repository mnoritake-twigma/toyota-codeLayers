import { cors, json, rest } from "../_shared/http.ts";
import { validateRequest } from "../_shared/validate.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let value;
  try {
    value = await req.json();
  } catch {
    return json({ error: "入力内容をご確認ください。" }, 400);
  }
  const error = validateRequest(value);
  if (error) return json({ error }, 400);
  const receiptNumber = `LM-${crypto.randomUUID().replaceAll("-", "").toUpperCase()}`;
  try {
    const response = await rest("test_drive_requests", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        receipt_number: receiptNumber,
        model_code: value.modelCode,
        dealer_id: value.dealerId,
        name: value.name.trim(),
        kana: value.kana.trim(),
        email: value.email.trim(),
        phone: value.phone,
        preferred_1: value.preferred1,
        preferred_2: value.preferred2,
        notes: value.notes,
      }),
    });
    if (!response.ok)
      return json(
        {
          error: "お申し込みを保存できませんでした。入力内容をご確認ください。",
        },
        502,
      );
    return json({ receiptNumber }, 201);
  } catch {
    return json({ error: "通信に失敗しました。" }, 502);
  }
});

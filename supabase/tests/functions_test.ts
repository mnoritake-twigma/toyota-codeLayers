type Handler = (request: Request) => Response | Promise<Response>;
let current: Handler;
const originalServe = Deno.serve;
Object.defineProperty(Deno, "serve", {
  value: (handler: Handler) => {
    current = handler;
  },
  configurable: true,
});
await import("../functions/search-dealers/index.ts");
const search = current!;
await import("../functions/submit-request/index.ts");
const submit = current!;
Object.defineProperty(Deno, "serve", {
  value: originalServe,
  configurable: true,
});
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
const req = (body: unknown) =>
  new Request("https://demo.example.com/function", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
async function backend(run: () => Promise<void>, mock: typeof fetch) {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  Deno.env.set("SUPABASE_URL", "https://demo.example.com");
  Deno.env.set("SUPABASE_ANON_KEY", "public-demo");
  try {
    await run();
  } finally {
    globalThis.fetch = original;
    Deno.env.delete("SUPABASE_URL");
    Deno.env.delete("SUPABASE_ANON_KEY");
  }
}
Deno.test("CORS preflight and invalid inputs", async () => {
  for (const handler of [search, submit]) {
    const res = await handler(
      new Request("https://demo.example.com", { method: "OPTIONS" }),
    );
    assert(res.headers.get("Access-Control-Allow-Origin") === "*", "CORS");
    assert((await handler(req({}))).status === 400, "validation");
  }
});
Deno.test(
  "Search returns model-filtered vehicles and derived test-drive status",
  async () => {
    await backend(
      async () => {
        const res = await search(
          req({ modelCode: "M01", prefectureCode: "13" }),
        );
        const data = await res.json();
        assert(res.status === 200, "success");
        assert(data.dealers[0].vehicles.length === 1, "model filter");
        assert(data.dealers[0].hasTestCar === false, "display only");
      },
      async (input) => {
        assert(String(input).includes("dealer_vehicles(*)"), "new table query");
        return new Response(
          JSON.stringify([
            {
              id: "13-001",
              code: "D13001",
              lat: 35.68,
              lng: 139.76,
              dealer_vehicles: [
                { id: "v1", model_code: "M01", kind: "display" },
                { id: "v2", model_code: "M02", kind: "test_drive" },
              ],
            },
          ]),
        );
      },
    );
  },
);
Deno.test(
  "Submit rejects missing test car and saves vehicle ID and preferences on success",
  async () => {
    const body = {
      modelCode: "M01",
      dealerId: "13-011",
      vehicleId: "V-13-011-M01-1",
      name: "デモ",
      kana: "デモ",
      email: "demo@example.com",
      phone: "00000000000",
      preferred1: "2099-01-01T10:00:00+09:00",
      preferred2: "2099-01-02T10:00:00+09:00",
      notes: "",
    };
    let saves = 0,
      available = false;
    await backend(
      async () => {
        assert((await submit(req(body))).status === 400, "reject unavailable");
        assert(saves === 0, "no save");
        available = true;
        const res = await submit(req(body));
        assert(res.status === 201, "created");
        assert(
          /^LM-[A-F0-9]{32}$/.test((await res.json()).receiptNumber),
          "receipt",
        );
      },
      async (input, init) => {
        if (String(input).includes("dealer_vehicles?")) {
          assert(
            String(input).includes("kind=eq.test_drive"),
            "test drive required",
          );
          return new Response(
            JSON.stringify(available ? [{ id: body.vehicleId }] : []),
          );
        }
        saves++;
        const saved = JSON.parse(String(init?.body));
        assert(
          saved.vehicle_id === body.vehicleId &&
            saved.preferred_1 === body.preferred1,
          "saved contract",
        );
        return new Response(null, { status: 201 });
      },
    );
  },
);

import { assertEquals } from "@std/assert";
import { createApp } from "./src/app.ts";

function buildValidUrl(): URL {
  const url = new URL("http://localhost/api/receive-chat/");
  url.searchParams.set("date", "x");
  url.searchParams.set("steamid", "y");
  url.searchParams.set("charname", "z");
  url.searchParams.set("actName", "a");
  url.searchParams.set("eventId", "b");
  url.searchParams.set("eventCategory", "c");
  url.searchParams.set("eventType", "d");
  return url;
}

Deno.test("POST /api/receive-chat/ validates required query params", async () => {
  const app = createApp({ discordWebhookUrl: "http://mock.local/webhook" });

  const res = await app.fetch(
    new Request("http://localhost/api/receive-chat/", {
      method: "POST",
    }),
  );

  assertEquals(res.status, 400);
});

Deno.test("POST /api/receive-chat/ errors if webhook is missing", async () => {
  const app = createApp({ discordWebhookUrl: null });

  const res = await app.fetch(
    new Request(buildValidUrl(), {
      method: "POST",
    }),
  );

  assertEquals(res.status, 500);
});

Deno.test("POST /api/receive-chat/ posts to Discord webhook", async () => {
  const app = createApp({ discordWebhookUrl: "http://mock.local/webhook" });
  const originalFetch = globalThis.fetch;

  try {
    let called = false;

    globalThis.fetch = async (_input, init) => {
      called = true;
      assertEquals(init?.method, "POST");
      return new Response(null, { status: 204 });
    };

    const res = await app.fetch(
      new Request(buildValidUrl(), {
        method: "POST",
      }),
    );

    assertEquals(res.status, 200);
    assertEquals((await res.json()).ok, true);
    assertEquals(called, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

import { assertEquals } from "@std/assert";
import { createApp } from "./src/app.ts";

function buildValidUrl(channel = "2"): URL {
  const url = new URL("http://localhost/api/receive-chat/");
  url.searchParams.set("sender", "Malice");
  url.searchParams.set("character", "Malice");
  url.searchParams.set("message", "Hello");
  url.searchParams.set("radius", "Say");
  url.searchParams.set("location", "-172995 244168 3635");
  url.searchParams.set("channel", channel);
  return url;
}

Deno.test("GET /api/receive-chat/ ignores requests that don't match chat shape", async () => {
  const app = createApp({ discordWebhookUrl: "http://mock.local/webhook" });

  const res = await app.fetch(new Request("http://localhost/api/receive-chat/"));

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.ok, true);
  assertEquals(body.ignored, true);
});

Deno.test("GET /api/receive-chat/ errors if webhook is missing (for accepted channels)", async () => {
  const app = createApp({ discordWebhookUrl: null });

  const res = await app.fetch(new Request(buildValidUrl("1")));

  assertEquals(res.status, 500);
});

Deno.test("GET /api/receive-chat/ ignores unaccepted channels", async () => {
  const app = createApp({ discordWebhookUrl: null });

  const res = await app.fetch(new Request(buildValidUrl("3")));

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.ok, true);
  assertEquals(body.ignored, true);
  assertEquals(body.channel, 3);
});

Deno.test("GET /api/receive-chat/ posts to Discord webhook for channel 1/2", async () => {
  const app = createApp({ discordWebhookUrl: "http://mock.local/webhook" });
  const originalFetch = globalThis.fetch;

  try {
    let called = false;

    globalThis.fetch = async (_input, init) => {
      called = true;
      assertEquals(init?.method, "POST");
      return new Response(null, { status: 204 });
    };

    const res = await app.fetch(new Request(buildValidUrl("2")));

    assertEquals(res.status, 200);
    assertEquals((await res.json()).ok, true);
    assertEquals(called, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

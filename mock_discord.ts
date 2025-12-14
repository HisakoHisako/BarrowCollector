const lastPayloadByPath = new Map<string, unknown>();

Deno.serve({ port: 8787 }, async (req) => {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname.startsWith("/webhook")) {
    let payload: unknown = null;
    try {
      payload = await req.json();
    } catch {
      payload = await req.text().catch(() => null);
    }

    lastPayloadByPath.set(url.pathname, payload);
    lastPayloadByPath.set("/webhook", payload);

    console.log(`[mock-discord] ${url.pathname} received:`, payload);

    // Match Discord webhook behavior: 204 No Content on success.
    return new Response(null, { status: 204 });
  }

  if (req.method === "GET" && url.pathname === "/last") {
    return Response.json(
      {
        lastPayload: lastPayloadByPath.get("/webhook") ?? null,
        lastPayloadByPath: Object.fromEntries(lastPayloadByPath.entries()),
      },
      { status: 200 },
    );
  }

  return new Response("Not found", { status: 404 });
});

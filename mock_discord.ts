let lastPayload: unknown = null;

Deno.serve({ port: 8787 }, async (req) => {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/webhook") {
    try {
      lastPayload = await req.json();
    } catch {
      lastPayload = await req.text().catch(() => null);
    }

    console.log("[mock-discord] received:", lastPayload);

    // Match Discord webhook behavior: 204 No Content on success.
    return new Response(null, { status: 204 });
  }

  if (req.method === "GET" && url.pathname === "/last") {
    return Response.json({ lastPayload }, { status: 200 });
  }

  return new Response("Not found", { status: 404 });
});

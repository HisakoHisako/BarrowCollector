const baseUrl = Deno.env.get("BARROW_BASE_URL") ?? "http://localhost:8000";
const intervalMs = Number(Deno.env.get("PULSE_INTERVAL_MS") ?? "15000");

function buildUrl(): URL {
  const url = new URL("/api/receive-chat/", baseUrl);

  // Use slightly varying values so you can see requests are new.
  const now = new Date();

  url.searchParams.set("sender", "Malice");
  url.searchParams.set("character", "Malice");
  url.searchParams.set("message", `Test ping ${now.toISOString()}`);
  url.searchParams.set("radius", "Say");
  url.searchParams.set("location", "-172995 244168 3635");

  // Alternate between 1 and 2.
  url.searchParams.set("channel", now.getTime() % 2 === 0 ? "1" : "2");

  return url;
}

console.log(`[pulse] sending every ${intervalMs}ms to ${baseUrl}`);

// Run immediately, then on interval.
async function tick() {
  const url = buildUrl();
  try {
    const res = await fetch(url, { method: "GET" });
    console.log(`[pulse] ${new Date().toISOString()} -> ${res.status}`);
    // Drain body to avoid resource warnings.
    await res.arrayBuffer().catch(() => null);
  } catch (err) {
    console.error(`[pulse] error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

await tick();
setInterval(() => {
  void tick();
}, intervalMs);

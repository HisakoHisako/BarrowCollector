const baseUrl = Deno.env.get("BARROW_BASE_URL") ?? "http://localhost:8000";
const intervalMs = Number(Deno.env.get("PULSE_INTERVAL_MS") ?? "15000");

function buildUrl(): URL {
  const url = new URL("/api/receive-chat/", baseUrl);

  // Use slightly varying values so you can see requests are new.
  const now = new Date();

  url.searchParams.set("date", now.toISOString());
  url.searchParams.set("steamid", "y");
  url.searchParams.set("charname", "z");
  url.searchParams.set("actName", "a");
  url.searchParams.set("eventId", String(now.getTime()));
  url.searchParams.set("eventCategory", "c");
  url.searchParams.set("eventType", "d");

  return url;
}

console.log(`[pulse] sending every ${intervalMs}ms to ${baseUrl}`);

// Run immediately, then on interval.
async function tick() {
  const url = buildUrl();
  try {
    const res = await fetch(url, { method: "POST" });
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

const baseUrl = Deno.env.get("BARROW_BASE_URL") ?? "http://localhost:8000";

const url = new URL("/api/receive-chat/", baseUrl);
url.searchParams.set("date", "x");
url.searchParams.set("steamid", "y");
url.searchParams.set("charname", "z");
url.searchParams.set("actName", "a");
url.searchParams.set("eventId", "b");
url.searchParams.set("eventCategory", "c");
url.searchParams.set("eventType", "d");

const res = await fetch(url, { method: "POST" });
const text = await res.text();

console.log(`[send-test] ${res.status} ${res.statusText}`);
console.log(text);

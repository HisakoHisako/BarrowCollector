const baseUrl = Deno.env.get("BARROW_BASE_URL") ?? "http://localhost:8000";

const url = new URL("/api/receive-chat/", baseUrl);
url.searchParams.set("sender", "Malice");
url.searchParams.set("character", "Malice");
url.searchParams.set("message", "HAHA MER LOCAL!");
url.searchParams.set("radius", "Say");
url.searchParams.set("location", "-172995 244168 3635");
url.searchParams.set("channel", "2");

const res = await fetch(url, { method: "GET" });
const text = await res.text();

console.log(`[send-test] ${res.status} ${res.statusText}`);
console.log(text);

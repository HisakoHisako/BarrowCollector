import { createApp } from "./src/app.ts";

const app = createApp({
  discordWebhookGlobal: Deno.env.get("DISCORD_WEBHOOK_GLOBAL") ?? null,
  discordWebhookLocal: Deno.env.get("DISCORD_WEBHOOK_LOCAL") ?? null,
});

if (import.meta.main) {
  // Default Deno port is 8000 when unspecified; set explicitly for clarity.
  Deno.serve({ port: 8000 }, (req) => app.fetch(req));
}

import { createApp } from "./src/app.ts";

const app = createApp({
  discordWebhookUrl: Deno.env.get("DISCORD_WEBHOOK_URL") ?? null,
});

if (import.meta.main) {
  // Default Deno port is 8000 when unspecified; set explicitly for clarity.
  Deno.serve({ port: 8000 }, (req) => app.fetch(req));
}

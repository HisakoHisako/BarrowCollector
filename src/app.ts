import type { ReceiveChatParams } from "./types.ts";

import { Hono } from "hono";
import { formatDiscordMessage, postToDiscordWebhook } from "./discord.ts";

export type AppConfig = {
  // Pass the full Discord incoming webhook URL.
  // If null/undefined, the endpoint will return 500 (misconfigured).
  discordWebhookUrl?: string | null;
};

const REQUIRED_PARAMS: (keyof ReceiveChatParams)[] = [
  "date",
  "steamid",
  "charname",
  "actName",
  "eventId",
  "eventCategory",
  "eventType",
];

export function createApp(config: AppConfig = {}): Hono {
  const app = new Hono();

  app.post("/api/receive-chat/", async (c) => {
    const q = c.req.query();

    const missing = REQUIRED_PARAMS.filter((k) => {
      const v = q[k];
      return typeof v !== "string" || v.length === 0;
    });

    if (missing.length > 0) {
      return c.json(
        {
          ok: false,
          error: "Missing required query params",
          missing,
        },
        400,
      );
    }

    const params: ReceiveChatParams = {
      date: q.date,
      steamid: q.steamid,
      charname: q.charname,
      actName: q.actName,
      eventId: q.eventId,
      eventCategory: q.eventCategory,
      eventType: q.eventType,
    };

    const webhookUrl = config.discordWebhookUrl;

    if (!webhookUrl) {
      return c.json(
        {
          ok: false,
          error: "Server misconfigured: DISCORD_WEBHOOK_URL is not set",
          received: params,
        },
        500,
      );
    }

    try {
      await postToDiscordWebhook(webhookUrl, formatDiscordMessage(params));
      return c.json({ ok: true }, 200);
    } catch (err) {
      return c.json(
        {
          ok: false,
          error: "Failed to post to Discord webhook",
          detail: err instanceof Error ? err.message : String(err),
        },
        502,
      );
    }
  });

  return app;
}

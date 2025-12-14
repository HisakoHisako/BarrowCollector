import type { Context } from "hono";
import type { AppConfig } from "../config.ts";
import type { ReceiveChatParams } from "../types.ts";
import { formatDiscordMessage, postToDiscordWebhook } from "../discord.ts";

const REQUIRED_CHAT_PARAMS: (keyof ReceiveChatParams)[] = [
  "sender",
  "character",
  "message",
  "radius",
  "location",
  "channel",
];

const ACCEPTED_CHANNELS = new Set([1, 2]);

function parseChannel(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export async function handleReceiveChat(
  c: Context,
  config: AppConfig,
): Promise<Response> {
  const q = c.req.query();
  const channel = parseChannel(q.channel);

  const missing = REQUIRED_CHAT_PARAMS.filter((k) => {
    if (k === "channel") return channel === null;
    const v = q[k];
    return typeof v !== "string" || v.length === 0;
  });

  // If this doesn't look like a chat event (or is missing required chat fields),
  // we still return 200 so the upstream plugin doesn't treat it as an error.
  if (missing.length > 0) {
    return c.json(
      {
        ok: true,
        ignored: true,
        reason: "not_a_chat_event_or_missing_fields",
        missing,
      },
      200,
    );
  }

  // Only forward channels 1 (Global) or 2 (Local). For anything else, ack but ignore.
  if (channel === null || !ACCEPTED_CHANNELS.has(channel)) {
    return c.json({ ok: true, ignored: true, reason: "unaccepted_channel", channel }, 200);
  }

  const params: ReceiveChatParams = {
    sender: q.sender,
    character: q.character,
    message: q.message,
    radius: q.radius,
    location: q.location,
    channel,
  };

  const webhookUrl = channel === 1
    ? config.discordWebhookGlobal
    : channel === 2
    ? config.discordWebhookLocal
    : null;

  if (!webhookUrl) {
    // This is a real server misconfig for events we *do* want to forward.
    return c.json(
      {
        ok: false,
        error: "Server misconfigured: Discord webhook is not set for this channel",
        channel,
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
}

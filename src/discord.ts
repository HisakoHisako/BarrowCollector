import type { ReceiveChatParams } from "./types.ts";

type DiscordWebhookPayload = {
  content?: string;
  username?: string;
  allowed_mentions?: {
    parse: Array<"roles" | "users" | "everyone">;
  };
  // Not adding embeds/etc yet; keep minimal until we see real data.
};

export function formatDiscordMessage(params: ReceiveChatParams): DiscordWebhookPayload {
  const channelLabel = params.channel === 1
    ? "GLOBAL"
    : params.channel === 2
    ? "LOCAL"
    : String(params.channel);

  // Prefer `character` (the in-game visible name) since that's what moderators will care about.
  // Keep `sender` unused for now, until we see cases where it differs meaningfully.
  const lines = [
    `**${channelLabel}** (${params.radius})`,
    `**${params.character}**: ${params.message}`,
  ];

  return {
    content: lines.join("\n"),
    // Prevent chat messages from turning into unwanted pings (e.g. @everyone).
    allowed_mentions: { parse: [] },
  };
}

export async function postToDiscordWebhook(
  webhookUrl: string,
  payload: DiscordWebhookPayload,
): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Discord webhooks typically return 204 No Content on success.
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Discord webhook request failed: ${res.status} ${res.statusText}${
        body ? ` - ${body}` : ""
      }`,
    );
  }
}

import type { ReceiveChatParams } from "./types.ts";

type DiscordWebhookPayload = {
  content?: string;
  username?: string;
  // Not adding embeds/etc yet; keep minimal until we see real data.
};

export function formatDiscordMessage(params: ReceiveChatParams): DiscordWebhookPayload {
  const lines = [
    `**${params.eventCategory} / ${params.eventType}** (eventId: ${params.eventId})`,
    `act: ${params.actName}`,
    `char: ${params.charname} (steamid: ${params.steamid})`,
    `date: ${params.date}`,
  ];

  return {
    content: lines.join("\n"),
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

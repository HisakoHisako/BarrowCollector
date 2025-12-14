export type AppConfig = {
  // Discord Incoming Webhook URL for channel=1 (GLOBAL)
  discordWebhookGlobal?: string | null;

  // Discord Incoming Webhook URL for channel=2 (LOCAL)
  discordWebhookLocal?: string | null;
};

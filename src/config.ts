export type AppConfig = {
  // Pass the full Discord incoming webhook URL.
  // If null/undefined, the endpoint will return 500 (misconfigured).
  discordWebhookUrl?: string | null;
};

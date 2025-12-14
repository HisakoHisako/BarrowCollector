import { Hono } from "hono";
import { handleReceiveChat } from "./handlers/receive_chat.ts";
import type { AppConfig } from "./config.ts";

export function createApp(config: AppConfig = {}): Hono {
  const app = new Hono();

  // Conan Exiles plugin sends GET with query params.
  app.get("/api/receive-chat/", (c) => handleReceiveChat(c, config));

  return app;
}

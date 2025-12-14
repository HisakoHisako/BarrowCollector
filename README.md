# BarrowCollector
A tiny Deno + Hono API that receives Conan Exiles chat events via query-string GET requests and forwards selected messages to a Discord channel using an Incoming Webhook.

## What it does
- Exposes `GET /api/receive-chat/`
- Expects chat events as query params (no body)
- Only forwards messages where `channel` is `1` or `2`
- Posts to Discord via `DISCORD_WEBHOOK_URL`
- Prevents Discord mention abuse with `allowed_mentions: { parse: [] }`

## Endpoint
`GET /api/receive-chat/?sender=...&character=...&message=...&radius=...&location=...&channel=...`

Required query params:
- `sender` (string)
- `character` (string)
- `message` (string)
- `radius` (string)
- `location` (string)
- `channel` (number)

Behavior:
- If the request is missing chat fields or doesn’t look like a chat event: returns `200` and `{ ok: true, ignored: true, ... }`
- If `channel` is not `1` or `2`: returns `200` and `{ ok: true, ignored: true, reason: "unaccepted_channel", ... }`
- If `channel` is `1` or `2`: forwards to Discord and returns `{ ok: true }` on success

## Local development
### 1) Configure env
Copy `.env.example` to `.env` and edit as needed.

Minimum required:
- `DISCORD_WEBHOOK_URL`

### 2) Run the mock Discord server (optional)
This is useful to inspect what would be sent to Discord.

- `deno task mock-discord`
- Inspect last payload: `curl http://localhost:8787/last`

### 3) Run the API server
- `deno task dev`

### 4) Send test events
- One-shot: `deno task send-test`
- Every 15 seconds: `deno task pulse`

## Deployment (Deno Deploy - New Platform)
1. Set the entrypoint to `main.ts`.
2. Set the environment variable:
   - `DISCORD_WEBHOOK_URL` = the full Discord Incoming Webhook URL
3. Deploy.

## Notes
- The webhook URL is sensitive. Treat it like a secret.
- The service intentionally returns `200` for non-chat / non-matching events so upstream plugins don’t treat ignored events as errors.

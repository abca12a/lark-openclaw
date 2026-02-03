# CLAUDE.md - Lark OpenClaw Plugin

This file provides guidance to Claude Code when working on the Lark channel plugin.

## Project Overview

This is a Lark (International) channel plugin for OpenClaw/Clawdbot. It provides webhook-based integration with the Lark messaging platform.

## Key Implementation Notes

### Webhook HTTP Route Registration

**Critical:** When implementing a webhook-based channel plugin for OpenClaw, you MUST register the HTTP route with the Gateway's HTTP routing system using `registerPluginHttpRoute()` from `openclaw/plugin-sdk`.

```typescript
import { registerPluginHttpRoute, normalizePluginHttpPath } from "openclaw/plugin-sdk";

// In gateway.startAccount:
const webhookPath = account.config.webhookPath || "/lark/webhook";
const normalizedPath = normalizePluginHttpPath(webhookPath, "/lark/webhook") ?? "/lark/webhook";
const unregisterHttp = registerPluginHttpRoute({
  path: normalizedPath,
  pluginId: "lark",
  accountId: resolvedAccountId,
  log: (msg) => ctx.log?.info(msg),
  handler: provider.httpHandler,
});
```

Without this registration, the Gateway will not route HTTP requests to your webhook handler, and requests will return HTML (the control UI) instead of being processed.

### Lark Encrypted Webhooks - Decryption Order

**Critical:** When `encryptKey` is configured, Lark sends ALL webhook payloads encrypted, including URL verification challenges. You MUST decrypt the payload BEFORE checking the event type:

```typescript
// WRONG - will fail URL verification when encryption is enabled:
if (body.type === "url_verification") { ... }  // body.type won't exist!
if (body.encrypt) { decrypt... }

// CORRECT - decrypt first, then check type:
let eventData = body;
if (body.encrypt && encryptKey) {
  const cipher = new Lark.AESCipher(encryptKey);
  const decrypted = cipher.decrypt(body.encrypt);
  eventData = JSON.parse(decrypted);
}
if (eventData.type === "url_verification") {
  res.end(JSON.stringify({ challenge: eventData.challenge }));
}
```

### Lark Message Types - Handle Rich Text (post)

**Critical:** Lark has multiple message types. Don't only handle `text` messages - you MUST also handle `post` (rich text) messages which contain links, formatting, and @mentions:

```typescript
// WRONG - will silently ignore rich text messages:
if (message.message_type !== "text") return;

// CORRECT - handle both text and post:
if (messageType !== "text" && messageType !== "post") {
  log.info(`Skipping unsupported message type: ${messageType}`);
  return;
}

if (messageType === "text") {
  text = parsed.text;
} else if (messageType === "post") {
  text = extractTextFromPost(parsed);  // Extract plain text from rich content
}
```

Post content structure:
```json
{
  "zh_cn": {
    "content": [
      [{"tag": "text", "text": "Hello "}, {"tag": "a", "text": "link", "href": "https://..."}],
      [{"tag": "at", "user_id": "xxx", "user_name": "John"}]
    ]
  }
}
```

### Lark SDK Usage

- Use `@larksuiteoapi/node-sdk` for Lark API interactions
- Use `Lark.Domain.Lark` for international domain (open.larksuite.com)
- Use `Lark.AESCipher` for decrypting encrypted webhook payloads

## File Structure

- `src/channel.ts` - Main channel plugin and dock exports
- `src/receive.ts` - Webhook HTTP handler and message processing
- `src/send.ts` - Outbound message sending
- `src/accounts.ts` - Account resolution and configuration
- `src/types.ts` - TypeScript type definitions

## Build Commands

```bash
npm run build    # Compile TypeScript
npm run clean    # Remove dist/
```

## Testing

Test webhook locally:
```bash
curl -X POST http://localhost:18789/lark/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"url_verification","challenge":"test"}'
```

Expected response: `{"challenge":"test"}`

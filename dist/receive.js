/**
 * Lark Webhook message receive handler.
 *
 * Handles HTTP Webhook events from Lark Open Platform.
 * Uses Lark international domain: open.larksuite.com
 */
import * as Lark from "@larksuiteoapi/node-sdk";
import { isDuplicate, isEventDuplicate } from "./dedup.js";
import { shouldRespondInGroup } from "./group-filter.js";
import { sendTextMessage } from "./send.js";
// Runtime storage for channel integration
let larkRuntime = null;
export function setLarkRuntime(runtime) {
    larkRuntime = runtime;
}
export function getLarkRuntime() {
    return larkRuntime;
}
/** Handle incoming Lark message */
async function handleIncomingMessage(data, ctx) {
    const message = data.message;
    if (!message)
        return;
    const chatId = message.chat_id;
    if (!chatId)
        return;
    const messageId = message.message_id;
    if (messageId && isDuplicate(messageId))
        return;
    // Only handle text messages
    if (message.message_type !== "text" || !message.content)
        return;
    let text;
    try {
        const parsed = JSON.parse(message.content);
        text = (parsed.text ?? "").trim();
    }
    catch {
        return;
    }
    if (!text)
        return;
    const chatType = message.chat_type;
    const sender = data.sender;
    const senderId = sender?.sender_id?.open_id ?? "";
    // Group chat filter
    if (chatType === "group") {
        const mentions = message.mentions ?? [];
        text = text.replace(/@_user_\d+\s*/g, "").trim();
        if (!text || !shouldRespondInGroup(text, mentions, ctx.botNames))
            return;
    }
    ctx.statusSink?.({ lastInboundAt: Date.now() });
    ctx.log.info(`[lark:${ctx.account.accountId}] Received: ${text.slice(0, 80)}`);
    // Dispatch to OpenClaw runtime if available
    const runtime = getLarkRuntime();
    if (runtime?.channel?.reply?.dispatchReplyWithBufferedBlockDispatcher) {
        try {
            // Build a minimal MsgContext for the runtime
            const msgCtx = {
                channel: "lark",
                accountId: ctx.account.accountId,
                chatId,
                chatType: (chatType === "p2p" ? "direct" : "group"),
                senderId,
                text,
                messageId,
                timestamp: Date.now(),
            };
            // Get config from runtime
            const cfg = runtime.config?.loadConfig?.() ?? ctx.config;
            await runtime.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
                ctx: msgCtx,
                cfg: cfg,
                dispatcherOptions: {
                    thinkingThresholdMs: ctx.thinkingThresholdMs,
                },
            });
            ctx.statusSink?.({ lastOutboundAt: Date.now() });
        }
        catch (err) {
            ctx.log.error(`[lark] Dispatch error: ${err}`);
        }
    }
    else {
        // Fallback: echo response (for testing without full runtime)
        try {
            await sendTextMessage(ctx.client, chatId, `Echo: ${text}`);
            ctx.statusSink?.({ lastOutboundAt: Date.now() });
        }
        catch (err) {
            ctx.log.error(`[lark] Send error: ${err}`);
        }
    }
}
/**
 * Start the Lark Webhook provider.
 * Returns HTTP handler and stop function.
 */
export function startLarkWebhookProvider(options) {
    const { account, config, log, statusSink } = options;
    const { appId, appSecret } = account;
    const encryptKey = account.config.encryptKey || "";
    const webhookPath = account.config.webhookPath || "/lark/webhook";
    const thinkingThresholdMs = account.config.thinkingThresholdMs ?? 2500;
    const botNames = account.config.botNames;
    log.info(`[lark:${account.accountId}] Starting Webhook provider`);
    // Create Lark client with international domain
    const client = new Lark.Client({
        appId,
        appSecret,
        domain: Lark.Domain.Lark, // International domain
        appType: Lark.AppType.SelfBuild,
    });
    statusSink?.({ running: true, lastStartAt: Date.now() });
    // HTTP handler for webhook
    const httpHandler = async (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (url.pathname !== webhookPath)
            return;
        log.info(`[lark:${account.accountId}] Webhook request received`);
        try {
            // Read body
            const chunks = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            const rawBody = Buffer.concat(chunks).toString("utf-8");
            let body;
            try {
                body = JSON.parse(rawBody);
            }
            catch {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Invalid JSON" }));
                return;
            }
            // Decrypt if needed (do this FIRST, before checking type)
            let eventData = body;
            if (body.encrypt && encryptKey) {
                try {
                    const cipher = new Lark.AESCipher(encryptKey);
                    const decrypted = cipher.decrypt(body.encrypt);
                    eventData = JSON.parse(decrypted);
                    log.info(`[lark] Decrypted event data`);
                }
                catch (err) {
                    log.error(`[lark] Decrypt failed: ${err}`);
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "Decrypt failed" }));
                    return;
                }
            }
            // URL verification challenge (check after decryption)
            if (eventData.type === "url_verification") {
                log.info(`[lark] URL verification challenge`);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ challenge: eventData.challenge }));
                return;
            }
            // Check for duplicate events
            const eventId = eventData.header?.event_id;
            if (eventId && isEventDuplicate(eventId)) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ code: 0 }));
                return;
            }
            // Return 200 immediately
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ code: 0 }));
            // Process message async
            const eventType = eventData.header?.event_type;
            if (eventType === "im.message.receive_v1") {
                handleIncomingMessage(eventData.event, {
                    client,
                    account,
                    config,
                    log,
                    thinkingThresholdMs,
                    botNames,
                    statusSink,
                }).catch((err) => {
                    log.error(`[lark] Handler error: ${err}`);
                });
            }
        }
        catch (err) {
            log.error(`[lark] Webhook error: ${err}`);
            if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Internal error" }));
            }
        }
    };
    const stop = () => {
        log.info(`[lark:${account.accountId}] Stopping Webhook provider`);
        statusSink?.({ running: false, lastStopAt: Date.now() });
    };
    return { stop, webhookPath, httpHandler };
}
//# sourceMappingURL=receive.js.map
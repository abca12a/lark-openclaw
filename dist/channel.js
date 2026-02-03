/**
 * Lark ChannelPlugin + ChannelDock — core channel integration.
 *
 * Lark (International) uses Webhook mode only.
 */
import * as Lark from "@larksuiteoapi/node-sdk";
import { applyAccountNameToChannelSection, DEFAULT_ACCOUNT_ID, deleteAccountFromConfigSection, formatPairingApproveHint, migrateBaseNameToDefaultAccount, normalizeAccountId, normalizePluginHttpPath, PAIRING_APPROVED_MESSAGE, registerPluginHttpRoute, setAccountEnabledInConfigSection, } from "openclaw/plugin-sdk";
import { listLarkAccountIds, resolveDefaultLarkAccountId, resolveLarkAccount } from "./accounts.js";
import { LarkConfigJsonSchema } from "./config-json-schema.js";
import { larkOnboardingAdapter } from "./onboarding.js";
import { probeLark } from "./probe.js";
import { sendTextMessage, sendMediaMessage } from "./send.js";
import { startLarkWebhookProvider } from "./receive.js";
const meta = {
    id: "lark",
    label: "Lark",
    selectionLabel: "Lark (International)",
    docsPath: "/channels/lark",
    docsLabel: "lark",
    blurb: "Lark international messaging platform with Webhook API.",
    aliases: ["larksuite"],
    order: 86,
    quickstartAllowFrom: true,
};
function normalizeLarkMessagingTarget(raw) {
    const trimmed = raw?.trim();
    if (!trimmed)
        return undefined;
    return trimmed.replace(/^(lark|larksuite):/i, "");
}
/** Create a Lark SDK Client for an account. */
function createLarkClient(account) {
    return new Lark.Client({
        appId: account.appId,
        appSecret: account.appSecret,
        domain: Lark.Domain.Lark, // International domain
        appType: Lark.AppType.SelfBuild,
    });
}
/** Lark channel dock (simplified channel adapter). */
export const larkDock = {
    id: "lark",
    capabilities: {
        chatTypes: ["direct", "group"],
        media: true,
        blockStreaming: true,
    },
    outbound: { textChunkLimit: 4000 },
    config: {
        resolveAllowFrom: ({ cfg, accountId }) => (resolveLarkAccount({ cfg, accountId }).config.allowFrom ?? []).map((entry) => String(entry)),
        formatAllowFrom: ({ allowFrom }) => allowFrom
            .map((entry) => String(entry).trim())
            .filter(Boolean)
            .map((entry) => entry.replace(/^(lark|larksuite):/i, ""))
            .map((entry) => entry.toLowerCase()),
    },
    groups: {
        resolveRequireMention: () => true,
    },
    threading: {
        resolveReplyToMode: () => "off",
    },
};
/** Lark channel plugin (full plugin interface). */
export const larkPlugin = {
    id: "lark",
    meta,
    onboarding: larkOnboardingAdapter,
    capabilities: {
        chatTypes: ["direct", "group"],
        media: true,
        reactions: false,
        threads: false,
        polls: false,
        nativeCommands: false,
        blockStreaming: true,
    },
    reload: { configPrefixes: ["channels.lark"] },
    configSchema: { schema: LarkConfigJsonSchema },
    config: {
        listAccountIds: (cfg) => listLarkAccountIds(cfg),
        resolveAccount: (cfg, accountId) => resolveLarkAccount({ cfg, accountId }),
        defaultAccountId: (cfg) => resolveDefaultLarkAccountId(cfg),
        setAccountEnabled: ({ cfg, accountId, enabled, }) => setAccountEnabledInConfigSection({
            cfg,
            sectionKey: "lark",
            accountId,
            enabled,
            allowTopLevel: true,
        }),
        deleteAccount: ({ cfg, accountId }) => deleteAccountFromConfigSection({
            cfg,
            sectionKey: "lark",
            accountId,
            clearBaseFields: ["appId", "appSecret", "name"],
        }),
        isConfigured: (account) => Boolean(account.appId?.trim() && account.appSecret?.trim()),
        describeAccount: (account) => ({
            accountId: account.accountId,
            name: account.name,
            enabled: account.enabled,
            configured: Boolean(account.appId?.trim() && account.appSecret?.trim()),
            tokenSource: account.tokenSource,
        }),
        resolveAllowFrom: ({ cfg, accountId }) => (resolveLarkAccount({ cfg, accountId }).config.allowFrom ?? []).map((entry) => String(entry)),
        formatAllowFrom: ({ allowFrom }) => allowFrom
            .map((entry) => String(entry).trim())
            .filter(Boolean)
            .map((entry) => entry.replace(/^(lark|larksuite):/i, ""))
            .map((entry) => entry.toLowerCase()),
    },
    security: {
        resolveDmPolicy: ({ cfg, accountId, account, }) => {
            const resolvedAccountId = accountId ?? account.accountId ?? DEFAULT_ACCOUNT_ID;
            const useAccountPath = Boolean(cfg.channels?.lark?.accounts?.[resolvedAccountId]);
            const basePath = useAccountPath ? `channels.lark.accounts.${resolvedAccountId}.` : "channels.lark.";
            return {
                policy: account.config.dmPolicy ?? "pairing",
                allowFrom: account.config.allowFrom ?? [],
                policyPath: `${basePath}dmPolicy`,
                allowFromPath: basePath,
                approveHint: formatPairingApproveHint("lark"),
                normalizeEntry: (raw) => raw.replace(/^(lark|larksuite):/i, ""),
            };
        },
    },
    groups: {
        resolveRequireMention: () => true,
    },
    threading: {
        resolveReplyToMode: () => "off",
    },
    messaging: {
        normalizeTarget: normalizeLarkMessagingTarget,
        targetResolver: {
            looksLikeId: (raw) => {
                const trimmed = raw.trim();
                if (!trimmed)
                    return false;
                // Lark chat IDs: oc_xxxxx, ou_xxxxx, on_xxxxx
                return /^(oc|ou|on)_[a-f0-9]+$/i.test(trimmed) || /^[a-f0-9]{20,}$/i.test(trimmed);
            },
            hint: "<chatId>",
        },
    },
    directory: {
        self: async () => null,
        listPeers: async ({ cfg, accountId, query, limit, }) => {
            const account = resolveLarkAccount({ cfg, accountId });
            const q = query?.trim().toLowerCase() || "";
            const peers = Array.from(new Set((account.config.allowFrom ?? [])
                .map((entry) => String(entry).trim())
                .filter((entry) => Boolean(entry) && entry !== "*")
                .map((entry) => entry.replace(/^(lark|larksuite):/i, ""))))
                .filter((id) => (q ? id.toLowerCase().includes(q) : true))
                .slice(0, limit && limit > 0 ? limit : undefined)
                .map((id) => ({ kind: "user", id }));
            return peers;
        },
        listGroups: async () => [],
    },
    setup: {
        resolveAccountId: ({ accountId }) => normalizeAccountId(accountId),
        applyAccountName: ({ cfg, accountId, name, }) => applyAccountNameToChannelSection({
            cfg,
            channelKey: "lark",
            accountId,
            name,
        }),
        validateInput: ({ accountId, input }) => {
            if (!input.appId && !input.appSecret) {
                return "Lark requires appId and appSecret.";
            }
            return null;
        },
        applyAccountConfig: ({ cfg, accountId, input, }) => {
            const namedConfig = applyAccountNameToChannelSection({
                cfg,
                channelKey: "lark",
                accountId,
                name: input.name,
            });
            const next = accountId !== DEFAULT_ACCOUNT_ID
                ? migrateBaseNameToDefaultAccount({
                    cfg: namedConfig,
                    channelKey: "lark",
                })
                : namedConfig;
            if (accountId === DEFAULT_ACCOUNT_ID) {
                const existingLark = next.channels?.lark ?? {};
                return {
                    ...next,
                    channels: {
                        ...(next.channels ?? {}),
                        lark: {
                            ...existingLark,
                            enabled: true,
                            ...(input.appId ? { appId: input.appId } : {}),
                            ...(input.appSecret ? { appSecret: input.appSecret } : {}),
                        },
                    },
                };
            }
            const larkCfg = (next.channels?.lark ?? {});
            const accountsCfg = larkCfg.accounts ?? {};
            const existingAccount = accountsCfg[accountId] ?? {};
            return {
                ...next,
                channels: {
                    ...(next.channels ?? {}),
                    lark: {
                        ...larkCfg,
                        enabled: true,
                        accounts: {
                            ...accountsCfg,
                            [accountId]: {
                                ...existingAccount,
                                enabled: true,
                                ...(input.appId ? { appId: input.appId } : {}),
                                ...(input.appSecret ? { appSecret: input.appSecret } : {}),
                            },
                        },
                    },
                },
            };
        },
    },
    pairing: {
        idLabel: "larkUserId",
        normalizeAllowEntry: (entry) => entry.replace(/^(lark|larksuite):/i, ""),
        notifyApproval: async ({ cfg, id }) => {
            const account = resolveLarkAccount({ cfg });
            if (!account.appId || !account.appSecret) {
                throw new Error("Lark credentials not configured");
            }
            const client = createLarkClient(account);
            await sendTextMessage(client, id, PAIRING_APPROVED_MESSAGE);
        },
    },
    outbound: {
        deliveryMode: "direct",
        chunker: (text, limit) => {
            if (!text)
                return [];
            if (limit <= 0 || text.length <= limit)
                return [text];
            const chunks = [];
            let remaining = text;
            while (remaining.length > limit) {
                const window = remaining.slice(0, limit);
                const lastNewline = window.lastIndexOf("\n");
                const lastSpace = window.lastIndexOf(" ");
                let breakIdx = lastNewline > 0 ? lastNewline : lastSpace;
                if (breakIdx <= 0)
                    breakIdx = limit;
                const rawChunk = remaining.slice(0, breakIdx);
                const chunk = rawChunk.trimEnd();
                if (chunk.length > 0)
                    chunks.push(chunk);
                const brokeOnSeparator = breakIdx < remaining.length && /\s/.test(remaining[breakIdx]);
                const nextStart = Math.min(remaining.length, breakIdx + (brokeOnSeparator ? 1 : 0));
                remaining = remaining.slice(nextStart).trimStart();
            }
            if (remaining.length)
                chunks.push(remaining);
            return chunks;
        },
        chunkerMode: "text",
        textChunkLimit: 4000,
        sendText: async ({ to, text, accountId, cfg, }) => {
            const account = resolveLarkAccount({
                accountId: accountId ?? undefined,
                cfg,
            });
            if (!account.appId || !account.appSecret) {
                return { channel: "lark", ok: false, messageId: "", error: new Error("Lark credentials not configured") };
            }
            const client = createLarkClient(account);
            const result = await sendTextMessage(client, to, text);
            return {
                channel: "lark",
                ok: result.ok,
                messageId: result.messageId ?? "",
                error: result.error ? new Error(result.error) : undefined,
            };
        },
        sendMedia: async ({ to, text, mediaUrl, accountId, cfg, }) => {
            const account = resolveLarkAccount({
                accountId: accountId ?? undefined,
                cfg,
            });
            if (!account.appId || !account.appSecret) {
                return { channel: "lark", ok: false, messageId: "", error: new Error("Lark credentials not configured") };
            }
            const client = createLarkClient(account);
            const result = await sendMediaMessage(client, to, mediaUrl ?? "", text);
            return {
                channel: "lark",
                ok: result.ok,
                messageId: result.messageId ?? "",
                error: result.error ? new Error(result.error) : undefined,
            };
        },
    },
    status: {
        defaultRuntime: {
            accountId: DEFAULT_ACCOUNT_ID,
            running: false,
            lastStartAt: null,
            lastStopAt: null,
            lastError: null,
        },
        collectStatusIssues: () => [],
        buildChannelSummary: ({ snapshot }) => ({
            configured: snapshot.configured ?? false,
            tokenSource: snapshot.tokenSource ?? "none",
            running: snapshot.running ?? false,
            mode: "webhook",
            lastStartAt: snapshot.lastStartAt ?? null,
            lastStopAt: snapshot.lastStopAt ?? null,
            lastError: snapshot.lastError ?? null,
            probe: snapshot.probe,
            lastProbeAt: snapshot.lastProbeAt ?? null,
        }),
        probeAccount: async ({ account, timeoutMs }) => probeLark(account.appId, account.appSecret, timeoutMs),
        buildAccountSnapshot: ({ account, runtime, }) => {
            const configured = Boolean(account.appId?.trim() && account.appSecret?.trim());
            return {
                accountId: account.accountId,
                name: account.name,
                enabled: account.enabled,
                configured,
                tokenSource: account.tokenSource,
                running: runtime?.running ?? false,
                lastStartAt: runtime?.lastStartAt ?? null,
                lastStopAt: runtime?.lastStopAt ?? null,
                lastError: runtime?.lastError ?? null,
                mode: "webhook",
                lastInboundAt: runtime?.lastInboundAt ?? null,
                lastOutboundAt: runtime?.lastOutboundAt ?? null,
                dmPolicy: account.config.dmPolicy ?? "pairing",
                appId: account.appId ? `${account.appId.slice(0, 8)}...` : undefined,
            };
        },
    },
    gateway: {
        startAccount: async (ctx) => {
            const account = ctx.account;
            const resolvedAccountId = ctx.accountId;
            let larkBotLabel = "";
            try {
                const probe = await probeLark(account.appId, account.appSecret, 3000);
                const name = probe.ok ? probe.bot?.name?.trim() : null;
                if (name)
                    larkBotLabel = ` (${name})`;
                ctx.setStatus({ accountId: account.accountId, bot: probe.bot });
            }
            catch {
                // Ignore probe errors during startup
            }
            ctx.log?.info(`[${account.accountId}] Starting Lark provider in webhook mode${larkBotLabel}`);
            const provider = startLarkWebhookProvider({
                account,
                config: ctx.cfg,
                log: {
                    info: (msg) => ctx.log?.info(msg),
                    error: (msg) => ctx.log?.error(msg),
                },
                abortSignal: ctx.abortSignal,
                statusSink: (patch) => ctx.setStatus({ accountId: resolvedAccountId, ...patch }),
            });
            // Register HTTP webhook route so gateway routes requests to us
            const webhookPath = account.config.webhookPath || "/lark/webhook";
            const normalizedPath = normalizePluginHttpPath(webhookPath, "/lark/webhook") ?? "/lark/webhook";
            const unregisterHttp = registerPluginHttpRoute({
                path: normalizedPath,
                pluginId: "lark",
                accountId: resolvedAccountId,
                log: (msg) => ctx.log?.info(msg),
                handler: provider.httpHandler,
            });
            ctx.log?.info(`[lark:${resolvedAccountId}] Webhook registered at ${normalizedPath}`);
            // Return a combined provider with both stop functions
            return {
                ...provider,
                stop: () => {
                    unregisterHttp();
                    provider.stop();
                },
            };
        },
    },
};
//# sourceMappingURL=channel.js.map
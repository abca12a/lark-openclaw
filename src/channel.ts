/**
 * Lark ChannelPlugin + ChannelDock — core channel integration.
 *
 * Lark (International) uses Webhook mode only.
 */

import * as Lark from "@larksuiteoapi/node-sdk";
import {
  applyAccountNameToChannelSection,
  DEFAULT_ACCOUNT_ID,
  deleteAccountFromConfigSection,
  formatPairingApproveHint,
  migrateBaseNameToDefaultAccount,
  normalizeAccountId,
  PAIRING_APPROVED_MESSAGE,
  setAccountEnabledInConfigSection,
} from "openclaw/plugin-sdk";
import { listLarkAccountIds, resolveDefaultLarkAccountId, resolveLarkAccount } from "./accounts.js";
import { LarkConfigJsonSchema } from "./config-json-schema.js";
import { larkOnboardingAdapter } from "./onboarding.js";
import { probeLark } from "./probe.js";
import { sendTextMessage, sendMediaMessage } from "./send.js";
import { startLarkWebhookProvider } from "./receive.js";
import type { LarkConfig, ResolvedLarkAccount } from "./types.js";

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

function normalizeLarkMessagingTarget(raw?: string): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^(lark|larksuite):/i, "");
}

/** Create a Lark SDK Client for an account. */
function createLarkClient(account: ResolvedLarkAccount): Lark.Client {
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
    chatTypes: ["direct", "group"] as ("direct" | "group")[],
    media: true,
    blockStreaming: true,
  },
  outbound: { textChunkLimit: 4000 },
  config: {
    resolveAllowFrom: ({ cfg, accountId }: { cfg: { channels?: { lark?: LarkConfig } }; accountId?: string }) =>
      (resolveLarkAccount({ cfg, accountId }).config.allowFrom ?? []).map((entry) => String(entry)),
    formatAllowFrom: ({ allowFrom }: { allowFrom: string[] }) =>
      allowFrom
        .map((entry) => String(entry).trim())
        .filter(Boolean)
        .map((entry) => entry.replace(/^(lark|larksuite):/i, ""))
        .map((entry) => entry.toLowerCase()),
  },
  groups: {
    resolveRequireMention: () => true,
  },
  threading: {
    resolveReplyToMode: () => "off" as const,
  },
};

/** Lark channel plugin (full plugin interface). */
export const larkPlugin = {
  id: "lark",
  meta,
  onboarding: larkOnboardingAdapter,
  capabilities: {
    chatTypes: ["direct", "group"] as ("direct" | "group")[],
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
    listAccountIds: (cfg: { channels?: { lark?: LarkConfig } }) => listLarkAccountIds(cfg),
    resolveAccount: (cfg: { channels?: { lark?: LarkConfig } }, accountId?: string) =>
      resolveLarkAccount({ cfg, accountId }),
    defaultAccountId: (cfg: { channels?: { lark?: LarkConfig } }) => resolveDefaultLarkAccountId(cfg),
    setAccountEnabled: ({
      cfg,
      accountId,
      enabled,
    }: {
      cfg: { channels?: { lark?: LarkConfig } };
      accountId: string;
      enabled: boolean;
    }) =>
      setAccountEnabledInConfigSection({
        cfg,
        sectionKey: "lark",
        accountId,
        enabled,
        allowTopLevel: true,
      }),
    deleteAccount: ({ cfg, accountId }: { cfg: { channels?: { lark?: LarkConfig } }; accountId: string }) =>
      deleteAccountFromConfigSection({
        cfg,
        sectionKey: "lark",
        accountId,
        clearBaseFields: ["appId", "appSecret", "name"],
      }),
    isConfigured: (account: ResolvedLarkAccount) => Boolean(account.appId?.trim() && account.appSecret?.trim()),
    describeAccount: (account: ResolvedLarkAccount) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: Boolean(account.appId?.trim() && account.appSecret?.trim()),
      tokenSource: account.tokenSource,
    }),
    resolveAllowFrom: ({ cfg, accountId }: { cfg: { channels?: { lark?: LarkConfig } }; accountId?: string }) =>
      (resolveLarkAccount({ cfg, accountId }).config.allowFrom ?? []).map((entry) => String(entry)),
    formatAllowFrom: ({ allowFrom }: { allowFrom: string[] }) =>
      allowFrom
        .map((entry) => String(entry).trim())
        .filter(Boolean)
        .map((entry) => entry.replace(/^(lark|larksuite):/i, ""))
        .map((entry) => entry.toLowerCase()),
  },
  security: {
    resolveDmPolicy: ({
      cfg,
      accountId,
      account,
    }: {
      cfg: { channels?: { lark?: LarkConfig } };
      accountId?: string;
      account: ResolvedLarkAccount;
    }) => {
      const resolvedAccountId = accountId ?? account.accountId ?? DEFAULT_ACCOUNT_ID;
      const useAccountPath = Boolean(cfg.channels?.lark?.accounts?.[resolvedAccountId]);
      const basePath = useAccountPath ? `channels.lark.accounts.${resolvedAccountId}.` : "channels.lark.";
      return {
        policy: account.config.dmPolicy ?? "pairing",
        allowFrom: account.config.allowFrom ?? [],
        policyPath: `${basePath}dmPolicy`,
        allowFromPath: basePath,
        approveHint: formatPairingApproveHint("lark"),
        normalizeEntry: (raw: string) => raw.replace(/^(lark|larksuite):/i, ""),
      };
    },
  },
  groups: {
    resolveRequireMention: () => true,
  },
  threading: {
    resolveReplyToMode: () => "off" as const,
  },
  messaging: {
    normalizeTarget: normalizeLarkMessagingTarget,
    targetResolver: {
      looksLikeId: (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return false;
        // Lark chat IDs: oc_xxxxx, ou_xxxxx, on_xxxxx
        return /^(oc|ou|on)_[a-f0-9]+$/i.test(trimmed) || /^[a-f0-9]{20,}$/i.test(trimmed);
      },
      hint: "<chatId>",
    },
  },
  directory: {
    self: async () => null,
    listPeers: async ({
      cfg,
      accountId,
      query,
      limit,
    }: {
      cfg: { channels?: { lark?: LarkConfig } };
      accountId?: string;
      query?: string;
      limit?: number;
    }) => {
      const account = resolveLarkAccount({ cfg, accountId });
      const q = query?.trim().toLowerCase() || "";
      const peers = Array.from(
        new Set(
          (account.config.allowFrom ?? [])
            .map((entry) => String(entry).trim())
            .filter((entry) => Boolean(entry) && entry !== "*")
            .map((entry) => entry.replace(/^(lark|larksuite):/i, ""))
        )
      )
        .filter((id) => (q ? id.toLowerCase().includes(q) : true))
        .slice(0, limit && limit > 0 ? limit : undefined)
        .map((id) => ({ kind: "user" as const, id }));
      return peers;
    },
    listGroups: async () => [],
  },
  setup: {
    resolveAccountId: ({ accountId }: { accountId?: string }) => normalizeAccountId(accountId),
    applyAccountName: ({
      cfg,
      accountId,
      name,
    }: {
      cfg: { channels?: { lark?: LarkConfig } };
      accountId: string;
      name?: string;
    }) =>
      applyAccountNameToChannelSection({
        cfg,
        channelKey: "lark",
        accountId,
        name,
      }),
    validateInput: ({ accountId, input }: { accountId: string; input: { appId?: string; appSecret?: string } }) => {
      if (!input.appId && !input.appSecret) {
        return "Lark requires appId and appSecret.";
      }
      return null;
    },
    applyAccountConfig: ({
      cfg,
      accountId,
      input,
    }: {
      cfg: { channels?: { lark?: LarkConfig } };
      accountId: string;
      input: { name?: string; appId?: string; appSecret?: string };
    }) => {
      const namedConfig = applyAccountNameToChannelSection({
        cfg,
        channelKey: "lark",
        accountId,
        name: input.name,
      }) as { channels?: { lark?: LarkConfig } };
      const next =
        accountId !== DEFAULT_ACCOUNT_ID
          ? (migrateBaseNameToDefaultAccount({
              cfg: namedConfig,
              channelKey: "lark",
            }) as { channels?: { lark?: LarkConfig } })
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
      const larkCfg = (next.channels?.lark ?? {}) as LarkConfig;
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
    normalizeAllowEntry: (entry: string) => entry.replace(/^(lark|larksuite):/i, ""),
    notifyApproval: async ({ cfg, id }: { cfg: { channels?: { lark?: LarkConfig } }; id: string }) => {
      const account = resolveLarkAccount({ cfg });
      if (!account.appId || !account.appSecret) {
        throw new Error("Lark credentials not configured");
      }
      const client = createLarkClient(account);
      await sendTextMessage(client, id, PAIRING_APPROVED_MESSAGE);
    },
  },
  outbound: {
    deliveryMode: "direct" as const,
    chunker: (text: string, limit: number) => {
      if (!text) return [];
      if (limit <= 0 || text.length <= limit) return [text];
      const chunks: string[] = [];
      let remaining = text;
      while (remaining.length > limit) {
        const window = remaining.slice(0, limit);
        const lastNewline = window.lastIndexOf("\n");
        const lastSpace = window.lastIndexOf(" ");
        let breakIdx = lastNewline > 0 ? lastNewline : lastSpace;
        if (breakIdx <= 0) breakIdx = limit;
        const rawChunk = remaining.slice(0, breakIdx);
        const chunk = rawChunk.trimEnd();
        if (chunk.length > 0) chunks.push(chunk);
        const brokeOnSeparator = breakIdx < remaining.length && /\s/.test(remaining[breakIdx]);
        const nextStart = Math.min(remaining.length, breakIdx + (brokeOnSeparator ? 1 : 0));
        remaining = remaining.slice(nextStart).trimStart();
      }
      if (remaining.length) chunks.push(remaining);
      return chunks;
    },
    chunkerMode: "text" as const,
    textChunkLimit: 4000,
    sendText: async ({
      to,
      text,
      accountId,
      cfg,
    }: {
      to: string;
      text: string;
      accountId?: string | null;
      cfg: { channels?: { lark?: LarkConfig } };
    }) => {
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
    sendMedia: async ({
      to,
      text,
      mediaUrl,
      accountId,
      cfg,
    }: {
      to: string;
      text?: string;
      mediaUrl?: string;
      accountId?: string | null;
      cfg: { channels?: { lark?: LarkConfig } };
    }) => {
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
    buildChannelSummary: ({ snapshot }: { snapshot: Record<string, unknown> }) => ({
      configured: snapshot.configured ?? false,
      tokenSource: snapshot.tokenSource ?? "none",
      running: snapshot.running ?? false,
      mode: "webhook" as const,
      lastStartAt: snapshot.lastStartAt ?? null,
      lastStopAt: snapshot.lastStopAt ?? null,
      lastError: snapshot.lastError ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null,
    }),
    probeAccount: async ({ account, timeoutMs }: { account: ResolvedLarkAccount; timeoutMs?: number }) =>
      probeLark(account.appId, account.appSecret, timeoutMs),
    buildAccountSnapshot: ({
      account,
      runtime,
    }: {
      account: ResolvedLarkAccount;
      runtime?: {
        running?: boolean;
        lastStartAt?: number | null;
        lastStopAt?: number | null;
        lastError?: string | null;
        lastInboundAt?: number | null;
        lastOutboundAt?: number | null;
      };
    }) => {
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
        mode: "webhook" as const,
        lastInboundAt: runtime?.lastInboundAt ?? null,
        lastOutboundAt: runtime?.lastOutboundAt ?? null,
        dmPolicy: account.config.dmPolicy ?? "pairing",
        appId: account.appId ? `${account.appId.slice(0, 8)}...` : undefined,
      };
    },
  },
  gateway: {
    startAccount: async (ctx: {
      account: ResolvedLarkAccount;
      accountId: string;
      cfg: { channels?: { lark?: LarkConfig } };
      log?: { info: (msg: string) => void; error: (msg: string) => void };
      abortSignal?: AbortSignal;
      setStatus: (patch: Record<string, unknown>) => void;
    }) => {
      const account = ctx.account;
      let larkBotLabel = "";
      try {
        const probe = await probeLark(account.appId, account.appSecret, 3000);
        const name = probe.ok ? probe.bot?.name?.trim() : null;
        if (name) larkBotLabel = ` (${name})`;
        ctx.setStatus({ accountId: account.accountId, bot: probe.bot });
      } catch {
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
        statusSink: (patch) => ctx.setStatus({ accountId: ctx.accountId, ...patch }),
      });
      return provider;
    },
  },
};

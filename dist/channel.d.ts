/**
 * Lark ChannelPlugin + ChannelDock — core channel integration.
 *
 * Lark (International) uses Webhook mode only.
 */
import type { LarkConfig, ResolvedLarkAccount } from "./types.js";
declare function normalizeLarkMessagingTarget(raw?: string): string | undefined;
/** Lark channel dock (simplified channel adapter). */
export declare const larkDock: {
    id: string;
    capabilities: {
        chatTypes: ("direct" | "group")[];
        media: boolean;
        blockStreaming: boolean;
    };
    outbound: {
        textChunkLimit: number;
    };
    config: {
        resolveAllowFrom: ({ cfg, accountId }: {
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            accountId?: string;
        }) => string[];
        formatAllowFrom: ({ allowFrom }: {
            allowFrom: string[];
        }) => string[];
    };
    groups: {
        resolveRequireMention: () => boolean;
    };
    threading: {
        resolveReplyToMode: () => "off";
    };
};
/** Lark channel plugin (full plugin interface). */
export declare const larkPlugin: {
    id: string;
    meta: {
        id: string;
        label: string;
        selectionLabel: string;
        docsPath: string;
        docsLabel: string;
        blurb: string;
        aliases: string[];
        order: number;
        quickstartAllowFrom: boolean;
    };
    onboarding: {
        configuredCheck: (cfg: {
            channels?: {
                lark?: LarkConfig;
            };
        }) => boolean;
        noteSetupHelp: (prompter: {
            note: (msg: string, title?: string) => Promise<void>;
        }) => Promise<void>;
    };
    capabilities: {
        chatTypes: ("direct" | "group")[];
        media: boolean;
        reactions: boolean;
        threads: boolean;
        polls: boolean;
        nativeCommands: boolean;
        blockStreaming: boolean;
    };
    reload: {
        configPrefixes: string[];
    };
    configSchema: {
        schema: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                appId: {
                    type: string;
                };
                appSecret: {
                    type: string;
                };
                webhookPath: {
                    type: string;
                };
                encryptKey: {
                    type: string;
                };
                verificationToken: {
                    type: string;
                };
                dmPolicy: {
                    type: string;
                    enum: string[];
                };
                allowFrom: {
                    type: string;
                    items: {
                        type: string[];
                    };
                };
                thinkingThresholdMs: {
                    type: string;
                };
                botNames: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                mediaMaxMb: {
                    type: string;
                };
                defaultAccount: {
                    type: string;
                };
                accounts: {
                    type: string;
                    additionalProperties: {
                        type: string;
                        properties: {
                            name: {
                                type: string;
                            };
                            enabled: {
                                type: string;
                            };
                            appId: {
                                type: string;
                            };
                            appSecret: {
                                type: string;
                            };
                            webhookPath: {
                                type: string;
                            };
                            encryptKey: {
                                type: string;
                            };
                            verificationToken: {
                                type: string;
                            };
                            dmPolicy: {
                                type: string;
                                enum: string[];
                            };
                            allowFrom: {
                                type: string;
                                items: {
                                    type: string[];
                                };
                            };
                            thinkingThresholdMs: {
                                type: string;
                            };
                            botNames: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            mediaMaxMb: {
                                type: string;
                            };
                        };
                    };
                };
            };
        };
    };
    config: {
        listAccountIds: (cfg: {
            channels?: {
                lark?: LarkConfig;
            };
        }) => string[];
        resolveAccount: (cfg: {
            channels?: {
                lark?: LarkConfig;
            };
        }, accountId?: string) => ResolvedLarkAccount;
        defaultAccountId: (cfg: {
            channels?: {
                lark?: LarkConfig;
            };
        }) => string;
        setAccountEnabled: ({ cfg, accountId, enabled, }: {
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            accountId: string;
            enabled: boolean;
        }) => import("openclaw/plugin-sdk").OpenClawConfig;
        deleteAccount: ({ cfg, accountId }: {
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            accountId: string;
        }) => import("openclaw/plugin-sdk").OpenClawConfig;
        isConfigured: (account: ResolvedLarkAccount) => boolean;
        describeAccount: (account: ResolvedLarkAccount) => {
            accountId: string;
            name: string | undefined;
            enabled: boolean;
            configured: boolean;
            tokenSource: import("./types.js").LarkTokenSource;
        };
        resolveAllowFrom: ({ cfg, accountId }: {
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            accountId?: string;
        }) => string[];
        formatAllowFrom: ({ allowFrom }: {
            allowFrom: string[];
        }) => string[];
    };
    security: {
        resolveDmPolicy: ({ cfg, accountId, account, }: {
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            accountId?: string;
            account: ResolvedLarkAccount;
        }) => {
            policy: "pairing" | "allowlist" | "open" | "disabled";
            allowFrom: (string | number)[];
            policyPath: string;
            allowFromPath: string;
            approveHint: string;
            normalizeEntry: (raw: string) => string;
        };
    };
    groups: {
        resolveRequireMention: () => boolean;
    };
    threading: {
        resolveReplyToMode: () => "off";
    };
    messaging: {
        normalizeTarget: typeof normalizeLarkMessagingTarget;
        targetResolver: {
            looksLikeId: (raw: string) => boolean;
            hint: string;
        };
    };
    directory: {
        self: () => Promise<null>;
        listPeers: ({ cfg, accountId, query, limit, }: {
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            accountId?: string;
            query?: string;
            limit?: number;
        }) => Promise<{
            kind: "user";
            id: string;
        }[]>;
        listGroups: () => Promise<never[]>;
    };
    setup: {
        resolveAccountId: ({ accountId }: {
            accountId?: string;
        }) => string;
        applyAccountName: ({ cfg, accountId, name, }: {
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            accountId: string;
            name?: string;
        }) => import("openclaw/plugin-sdk").OpenClawConfig;
        validateInput: ({ accountId, input }: {
            accountId: string;
            input: {
                appId?: string;
                appSecret?: string;
            };
        }) => "Lark requires appId and appSecret." | null;
        applyAccountConfig: ({ cfg, accountId, input, }: {
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            accountId: string;
            input: {
                name?: string;
                appId?: string;
                appSecret?: string;
            };
        }) => {
            channels: {
                lark: {
                    appSecret?: string;
                    appId?: string;
                    enabled: boolean;
                    accounts?: Record<string, import("./types.js").LarkAccountConfig>;
                    defaultAccount?: string;
                    name?: string;
                    webhookPath?: string;
                    encryptKey?: string;
                    verificationToken?: string;
                    dmPolicy?: "pairing" | "allowlist" | "open" | "disabled";
                    allowFrom?: Array<string | number>;
                    thinkingThresholdMs?: number;
                    botNames?: string[];
                    mediaMaxMb?: number;
                };
            };
        };
    };
    pairing: {
        idLabel: string;
        normalizeAllowEntry: (entry: string) => string;
        notifyApproval: ({ cfg, id }: {
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            id: string;
        }) => Promise<void>;
    };
    outbound: {
        deliveryMode: "direct";
        chunker: (text: string, limit: number) => string[];
        chunkerMode: "text";
        textChunkLimit: number;
        sendText: ({ to, text, accountId, cfg, }: {
            to: string;
            text: string;
            accountId?: string | null;
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
        }) => Promise<{
            channel: string;
            ok: boolean;
            messageId: string;
            error: Error | undefined;
        }>;
        sendMedia: ({ to, text, mediaUrl, accountId, cfg, }: {
            to: string;
            text?: string;
            mediaUrl?: string;
            accountId?: string | null;
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
        }) => Promise<{
            channel: string;
            ok: boolean;
            messageId: string;
            error: Error | undefined;
        }>;
    };
    status: {
        defaultRuntime: {
            accountId: string;
            running: boolean;
            lastStartAt: null;
            lastStopAt: null;
            lastError: null;
        };
        collectStatusIssues: () => never[];
        buildChannelSummary: ({ snapshot }: {
            snapshot: Record<string, unknown>;
        }) => {
            configured: {};
            tokenSource: {};
            running: {};
            mode: "webhook";
            lastStartAt: {} | null;
            lastStopAt: {} | null;
            lastError: {} | null;
            probe: unknown;
            lastProbeAt: {} | null;
        };
        probeAccount: ({ account, timeoutMs }: {
            account: ResolvedLarkAccount;
            timeoutMs?: number;
        }) => Promise<import("./types.js").LarkProbeResult>;
        buildAccountSnapshot: ({ account, runtime, }: {
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
            accountId: string;
            name: string | undefined;
            enabled: boolean;
            configured: boolean;
            tokenSource: import("./types.js").LarkTokenSource;
            running: boolean;
            lastStartAt: number | null;
            lastStopAt: number | null;
            lastError: string | null;
            mode: "webhook";
            lastInboundAt: number | null;
            lastOutboundAt: number | null;
            dmPolicy: "pairing" | "allowlist" | "open" | "disabled";
            appId: string | undefined;
        };
    };
    gateway: {
        startAccount: (ctx: {
            account: ResolvedLarkAccount;
            accountId: string;
            cfg: {
                channels?: {
                    lark?: LarkConfig;
                };
            };
            log?: {
                info: (msg: string) => void;
                error: (msg: string) => void;
            };
            abortSignal?: AbortSignal;
            setStatus: (patch: Record<string, unknown>) => void;
        }) => Promise<{
            stop: () => void;
            webhookPath: string;
            httpHandler: (req: {
                url?: string;
                method?: string;
                [Symbol.asyncIterator](): AsyncIterator<Buffer>;
            }, res: {
                statusCode: number;
                headersSent?: boolean;
                setHeader(name: string, value: string): void;
                end(data?: string): void;
            }) => Promise<void>;
        }>;
    };
};
export {};
//# sourceMappingURL=channel.d.ts.map
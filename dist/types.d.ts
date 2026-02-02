/**
 * Lark channel plugin — type definitions.
 */
/** Per-account configuration stored in config channels.lark */
export type LarkAccountConfig = {
    /** Optional display name for this account. */
    name?: string;
    /** If false, do not start this Lark account. Default: true. */
    enabled?: boolean;
    /** Lark App ID. */
    appId?: string;
    /** Lark App Secret. */
    appSecret?: string;
    /** Webhook path for receiving events. Default: /lark/webhook */
    webhookPath?: string;
    /** Encrypt key for event decryption (optional). */
    encryptKey?: string;
    /** Verification token for URL verification (optional). */
    verificationToken?: string;
    /** Direct message access policy (default: pairing). */
    dmPolicy?: "pairing" | "allowlist" | "open" | "disabled";
    /** Allowlist for DM senders (Lark open_id or union_id). */
    allowFrom?: Array<string | number>;
    /** "Thinking…" placeholder threshold in milliseconds. 0 to disable. */
    thinkingThresholdMs?: number;
    /** Bot name aliases used for group-chat address detection. */
    botNames?: string[];
    /** Max inbound media size in MB. */
    mediaMaxMb?: number;
};
/** Top-level Lark config section (channels.lark). */
export type LarkConfig = {
    /** Multi-account map. */
    accounts?: Record<string, LarkAccountConfig>;
    /** Default account ID when multiple accounts exist. */
    defaultAccount?: string;
} & LarkAccountConfig;
/** How the appId/appSecret were resolved. */
export type LarkTokenSource = "config" | "plugin" | "none";
/** Resolved account ready for use. */
export type ResolvedLarkAccount = {
    accountId: string;
    name?: string;
    enabled: boolean;
    appId: string;
    appSecret: string;
    tokenSource: LarkTokenSource;
    config: LarkAccountConfig;
};
/** Result of sending a message via Lark API. */
export type LarkSendResult = {
    ok: boolean;
    messageId?: string;
    error?: string;
};
/** Lark probe result. */
export type LarkProbeResult = {
    ok: boolean;
    bot?: {
        name?: string;
        openId?: string;
    };
    error?: string;
    elapsedMs: number;
};
/** Media type classification. */
export type LarkMediaType = "image" | "video" | "audio" | "file";
//# sourceMappingURL=types.d.ts.map
/**
 * Lark SDK utilities and helpers.
 */
export declare const DEFAULT_ACCOUNT_ID = "default";
/** Normalize account ID to lowercase, trimmed. */
export declare function normalizeAccountId(accountId?: string | null): string;
/** Add wildcard to allowFrom list. */
export declare function addWildcardAllowFrom(existing: Array<string | number>): Array<string | number>;
/** Pairing approval message. */
export declare const PAIRING_APPROVED_MESSAGE = "\u2705 You have been approved to chat with this bot.";
/** Format pairing approve hint. */
export declare function formatPairingApproveHint(channel: string): string;
//# sourceMappingURL=sdk.d.ts.map
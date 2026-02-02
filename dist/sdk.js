/**
 * Lark SDK utilities and helpers.
 */
export const DEFAULT_ACCOUNT_ID = "default";
/** Normalize account ID to lowercase, trimmed. */
export function normalizeAccountId(accountId) {
    const trimmed = accountId?.trim().toLowerCase();
    return trimmed || DEFAULT_ACCOUNT_ID;
}
/** Add wildcard to allowFrom list. */
export function addWildcardAllowFrom(existing) {
    if (existing.includes("*"))
        return existing;
    return [...existing, "*"];
}
/** Pairing approval message. */
export const PAIRING_APPROVED_MESSAGE = "✅ You have been approved to chat with this bot.";
/** Format pairing approve hint. */
export function formatPairingApproveHint(channel) {
    return `To approve a user, run: openclaw config set channels.${channel}.allowFrom '["<userId>"]' --json`;
}
//# sourceMappingURL=sdk.js.map
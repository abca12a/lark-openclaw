/**
 * Lark account resolution — multi-account support.
 */
import type { LarkConfig, ResolvedLarkAccount } from "./types.js";
/** List all configured Lark account IDs (falls back to ["default"]). */
export declare function listLarkAccountIds(cfg: {
    channels?: {
        lark?: LarkConfig;
    };
}): string[];
/** Resolve the default account ID. */
export declare function resolveDefaultLarkAccountId(cfg: {
    channels?: {
        lark?: LarkConfig;
    };
}): string;
/** Fully resolve a Lark account. */
export declare function resolveLarkAccount(params: {
    cfg: {
        channels?: {
            lark?: LarkConfig;
        };
        plugins?: unknown;
    };
    accountId?: string;
}): ResolvedLarkAccount;
/** List all enabled Lark accounts. */
export declare function listEnabledLarkAccounts(cfg: {
    channels?: {
        lark?: LarkConfig;
    };
    plugins?: unknown;
}): ResolvedLarkAccount[];
//# sourceMappingURL=accounts.d.ts.map
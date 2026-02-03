/**
 * Lark account resolution — multi-account support.
 */
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "openclaw/plugin-sdk";
function listConfiguredAccountIds(cfg) {
    const accounts = cfg.channels?.lark?.accounts;
    if (!accounts || typeof accounts !== "object")
        return [];
    return Object.keys(accounts).filter(Boolean);
}
/** List all configured Lark account IDs (falls back to ["default"]). */
export function listLarkAccountIds(cfg) {
    const ids = listConfiguredAccountIds(cfg);
    if (ids.length === 0)
        return [DEFAULT_ACCOUNT_ID];
    return ids.sort((a, b) => a.localeCompare(b));
}
/** Resolve the default account ID. */
export function resolveDefaultLarkAccountId(cfg) {
    const larkConfig = cfg.channels?.lark;
    if (larkConfig?.defaultAccount?.trim())
        return larkConfig.defaultAccount.trim();
    const ids = listLarkAccountIds(cfg);
    if (ids.includes(DEFAULT_ACCOUNT_ID))
        return DEFAULT_ACCOUNT_ID;
    return ids[0] ?? DEFAULT_ACCOUNT_ID;
}
function resolveAccountConfig(cfg, accountId) {
    const accounts = cfg.channels?.lark?.accounts;
    if (!accounts || typeof accounts !== "object")
        return undefined;
    return accounts[accountId];
}
function mergeLarkAccountConfig(cfg, accountId) {
    const raw = (cfg.channels?.lark ?? {});
    const { accounts: _ignored, defaultAccount: _ignored2, ...base } = raw;
    const account = resolveAccountConfig(cfg, accountId) ?? {};
    return { ...base, ...account };
}
/**
 * Resolve appId + appSecret for an account.
 */
function resolveCredentials(cfg, merged) {
    // From channel config
    if (merged.appId?.trim() && merged.appSecret?.trim()) {
        return {
            appId: merged.appId.trim(),
            appSecret: merged.appSecret.trim(),
            source: "config",
        };
    }
    // From plugin config
    const pluginCfg = cfg.plugins;
    const larkPluginCfg = pluginCfg?.entries?.lark?.config;
    if (larkPluginCfg?.appId?.trim() && larkPluginCfg?.appSecret?.trim()) {
        return {
            appId: larkPluginCfg.appId.trim(),
            appSecret: larkPluginCfg.appSecret.trim(),
            source: "plugin",
        };
    }
    return { appId: "", appSecret: "", source: "none" };
}
/** Fully resolve a Lark account. */
export function resolveLarkAccount(params) {
    const accountId = normalizeAccountId(params.accountId);
    const baseEnabled = params.cfg.channels?.lark?.enabled !== false;
    const merged = mergeLarkAccountConfig(params.cfg, accountId);
    const accountEnabled = merged.enabled !== false;
    const enabled = baseEnabled && accountEnabled;
    const creds = resolveCredentials(params.cfg, merged);
    return {
        accountId,
        name: merged.name?.trim() || undefined,
        enabled,
        appId: creds.appId,
        appSecret: creds.appSecret,
        tokenSource: creds.source,
        config: merged,
    };
}
/** List all enabled Lark accounts. */
export function listEnabledLarkAccounts(cfg) {
    return listLarkAccountIds(cfg)
        .map((accountId) => resolveLarkAccount({ cfg, accountId }))
        .filter((account) => account.enabled);
}
//# sourceMappingURL=accounts.js.map
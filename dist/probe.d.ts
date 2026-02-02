/**
 * Lark API connectivity probe.
 *
 * Validates credentials by fetching a tenant_access_token.
 * Uses Lark international domain: open.larksuite.com
 */
import type { LarkProbeResult } from "./types.js";
/**
 * Probe the Lark API by fetching tenant_access_token.
 * This is the standard way to validate appId + appSecret.
 */
export declare function probeLark(appId: string, appSecret: string, timeoutMs?: number): Promise<LarkProbeResult>;
//# sourceMappingURL=probe.d.ts.map
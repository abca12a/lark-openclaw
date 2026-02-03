/**
 * Lark Webhook message receive handler.
 *
 * Handles HTTP Webhook events from Lark Open Platform.
 * Uses Lark international domain: open.larksuite.com
 */
import type { ResolvedLarkAccount, LarkConfig } from "./types.js";
import type { PluginRuntime } from "openclaw/plugin-sdk";
/** Provider options */
type LarkProviderOptions = {
    account: ResolvedLarkAccount;
    config: {
        channels?: {
            lark?: LarkConfig;
        };
    };
    log: {
        info: (msg: string) => void;
        error: (msg: string) => void;
    };
    abortSignal?: AbortSignal;
    statusSink?: (patch: Record<string, unknown>) => void;
};
export declare function setLarkRuntime(runtime: PluginRuntime | null): void;
export declare function getLarkRuntime(): PluginRuntime | null;
/** HTTP request/response types */
type HttpRequest = {
    url?: string;
    method?: string;
    [Symbol.asyncIterator](): AsyncIterator<Buffer>;
};
type HttpResponse = {
    statusCode: number;
    headersSent?: boolean;
    setHeader(name: string, value: string): void;
    end(data?: string): void;
};
/**
 * Start the Lark Webhook provider.
 * Returns HTTP handler and stop function.
 */
export declare function startLarkWebhookProvider(options: LarkProviderOptions): {
    stop: () => void;
    webhookPath: string;
    httpHandler: (req: HttpRequest, res: HttpResponse) => Promise<void>;
};
export {};
//# sourceMappingURL=receive.d.ts.map
/**
 * Lark (International) channel plugin for OpenClaw.
 *
 * Webhook mode for Lark international platform.
 * Uses open.larksuite.com domain.
 */
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
interface PluginDefinition {
    id: string;
    name: string;
    description: string;
    configSchema: ReturnType<typeof emptyPluginConfigSchema>;
    register: (api: OpenClawPluginApi) => void;
}
declare const plugin: PluginDefinition;
export default plugin;
//# sourceMappingURL=index.openclaw.d.ts.map
/**
 * Lark (International) channel plugin for OpenClaw.
 *
 * Webhook mode for Lark international platform.
 * Uses open.larksuite.com domain.
 */
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { larkDock, larkPlugin } from "./channel.js";
import { setLarkRuntime } from "./receive.js";
const plugin = {
    id: "lark",
    name: "Lark",
    description: "Lark (International) channel plugin — Webhook mode",
    // Plugin-level config is empty; channel config lives under channels.lark.
    configSchema: emptyPluginConfigSchema(),
    register(api) {
        setLarkRuntime(api.runtime);
        api.registerChannel({
            plugin: larkPlugin,
            dock: larkDock,
        });
    },
};
export default plugin;
//# sourceMappingURL=index.openclaw.js.map
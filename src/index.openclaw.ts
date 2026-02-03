/**
 * Lark (International) channel plugin for OpenClaw.
 *
 * Webhook mode for Lark international platform.
 * Uses open.larksuite.com domain.
 */

import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { larkDock, larkPlugin } from "./channel.js";
import { setLarkRuntime } from "./receive.js";

import type { OpenClawPluginApi, PluginRuntime, ChannelPlugin, ChannelDock } from "openclaw/plugin-sdk";

interface PluginDefinition {
  id: string;
  name: string;
  description: string;
  configSchema: ReturnType<typeof emptyPluginConfigSchema>;
  register: (api: OpenClawPluginApi) => void;
}

const plugin: PluginDefinition = {
  id: "lark",
  name: "Lark",
  description: "Lark (International) channel plugin — Webhook mode",
  // Plugin-level config is empty; channel config lives under channels.lark.
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setLarkRuntime(api.runtime);
    api.registerChannel({
      plugin: larkPlugin as unknown as ChannelPlugin,
      dock: larkDock as unknown as ChannelDock,
    });
  },
};

export default plugin;

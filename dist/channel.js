/**
 * Lark ChannelPlugin — core channel integration.
 */
import * as Lark from "@larksuiteoapi/node-sdk";
import { LarkConfigJsonSchema } from "./config-json-schema.js";
const meta = {
    id: "lark",
    label: "Lark",
    selectionLabel: "Lark (International)",
    docsPath: "/channels/lark",
    docsLabel: "lark",
    blurb: "Lark international messaging platform with Webhook API.",
    aliases: ["larksuite"],
    order: 86,
    quickstartAllowFrom: true,
};
/** Create Lark client for an account */
function createLarkClient(account) {
    return new Lark.Client({
        appId: account.appId,
        appSecret: account.appSecret,
        domain: Lark.Domain.Lark,
        appType: Lark.AppType.SelfBuild,
    });
}
/** Lark channel plugin */
export const larkPlugin = {
    id: "lark",
    meta,
    capabilities: {
        chatTypes: ["direct", "group"],
        media: true,
        reactions: false,
        threads: false,
        polls: false,
        nativeCommands: false,
        blockStreaming: true,
    },
    reload: { configPrefixes: ["channels.lark"] },
    configSchema: { schema: LarkConfigJsonSchema },
};
//# sourceMappingURL=channel.js.map
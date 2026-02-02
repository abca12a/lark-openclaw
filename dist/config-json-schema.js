/**
 * Lark config JSON schema for validation.
 */
export const LarkConfigJsonSchema = {
    type: "object",
    properties: {
        enabled: { type: "boolean" },
        appId: { type: "string" },
        appSecret: { type: "string" },
        webhookPath: { type: "string" },
        encryptKey: { type: "string" },
        verificationToken: { type: "string" },
        dmPolicy: {
            type: "string",
            enum: ["pairing", "allowlist", "open", "disabled"],
        },
        allowFrom: {
            type: "array",
            items: { type: ["string", "number"] },
        },
        thinkingThresholdMs: { type: "number" },
        botNames: {
            type: "array",
            items: { type: "string" },
        },
        mediaMaxMb: { type: "number" },
        defaultAccount: { type: "string" },
        accounts: {
            type: "object",
            additionalProperties: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    enabled: { type: "boolean" },
                    appId: { type: "string" },
                    appSecret: { type: "string" },
                    webhookPath: { type: "string" },
                    encryptKey: { type: "string" },
                    verificationToken: { type: "string" },
                    dmPolicy: {
                        type: "string",
                        enum: ["pairing", "allowlist", "open", "disabled"],
                    },
                    allowFrom: {
                        type: "array",
                        items: { type: ["string", "number"] },
                    },
                    thinkingThresholdMs: { type: "number" },
                    botNames: {
                        type: "array",
                        items: { type: "string" },
                    },
                    mediaMaxMb: { type: "number" },
                },
            },
        },
    },
};
//# sourceMappingURL=config-json-schema.js.map
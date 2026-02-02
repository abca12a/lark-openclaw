/**
 * Lark config JSON schema for validation.
 */
export declare const LarkConfigJsonSchema: {
    type: string;
    properties: {
        enabled: {
            type: string;
        };
        appId: {
            type: string;
        };
        appSecret: {
            type: string;
        };
        webhookPath: {
            type: string;
        };
        encryptKey: {
            type: string;
        };
        verificationToken: {
            type: string;
        };
        dmPolicy: {
            type: string;
            enum: string[];
        };
        allowFrom: {
            type: string;
            items: {
                type: string[];
            };
        };
        thinkingThresholdMs: {
            type: string;
        };
        botNames: {
            type: string;
            items: {
                type: string;
            };
        };
        mediaMaxMb: {
            type: string;
        };
        defaultAccount: {
            type: string;
        };
        accounts: {
            type: string;
            additionalProperties: {
                type: string;
                properties: {
                    name: {
                        type: string;
                    };
                    enabled: {
                        type: string;
                    };
                    appId: {
                        type: string;
                    };
                    appSecret: {
                        type: string;
                    };
                    webhookPath: {
                        type: string;
                    };
                    encryptKey: {
                        type: string;
                    };
                    verificationToken: {
                        type: string;
                    };
                    dmPolicy: {
                        type: string;
                        enum: string[];
                    };
                    allowFrom: {
                        type: string;
                        items: {
                            type: string[];
                        };
                    };
                    thinkingThresholdMs: {
                        type: string;
                    };
                    botNames: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    mediaMaxMb: {
                        type: string;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=config-json-schema.d.ts.map
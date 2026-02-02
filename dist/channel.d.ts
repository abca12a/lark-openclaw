/**
 * Lark ChannelPlugin — core channel integration.
 */
/** Lark channel plugin */
export declare const larkPlugin: {
    id: string;
    meta: {
        id: string;
        label: string;
        selectionLabel: string;
        docsPath: string;
        docsLabel: string;
        blurb: string;
        aliases: string[];
        order: number;
        quickstartAllowFrom: boolean;
    };
    capabilities: {
        chatTypes: string[];
        media: boolean;
        reactions: boolean;
        threads: boolean;
        polls: boolean;
        nativeCommands: boolean;
        blockStreaming: boolean;
    };
    reload: {
        configPrefixes: string[];
    };
    configSchema: {
        schema: {
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
    };
};
//# sourceMappingURL=channel.d.ts.map
/**
 * Lark onboarding wizard adapter.
 */
import type { LarkConfig } from "./types.js";
/** Show Lark setup help */
declare function noteLarkSetupHelp(prompter: {
    note: (msg: string, title?: string) => Promise<void>;
}): Promise<void>;
/** Lark onboarding adapter */
export declare const larkOnboardingAdapter: {
    configuredCheck: (cfg: {
        channels?: {
            lark?: LarkConfig;
        };
    }) => boolean;
    noteSetupHelp: typeof noteLarkSetupHelp;
};
export {};
//# sourceMappingURL=onboarding.d.ts.map
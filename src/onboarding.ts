/**
 * Lark onboarding wizard adapter.
 */

import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk";
import { listLarkAccountIds, resolveLarkAccount } from "./accounts.js";
import type { LarkConfig } from "./types.js";

const channel = "lark";

/** Show Lark setup help */
async function noteLarkSetupHelp(prompter: {
  note: (msg: string, title?: string) => Promise<void>;
}): Promise<void> {
  await prompter.note(
    [
      "1) Go to https://open.larksuite.com/app → Create app",
      "2) Add Bot capability",
      '3) Enable permissions: im:message, im:message.group_at_msg, im:message.p2p_msg',
      "4) Events: add im.message.receive_v1, set to Webhook mode",
      "5) Configure your public Webhook URL",
      "6) Publish the app",
      "7) Note the App ID and App Secret",
      "",
      "Docs: https://open.larksuite.com/document/home/index",
    ].join("\n"),
    "Lark Bot Setup (Webhook Mode)"
  );
}

/** Lark onboarding adapter */
export const larkOnboardingAdapter = {
  configuredCheck: (cfg: { channels?: { lark?: LarkConfig } }) => {
    return listLarkAccountIds(cfg).some((accountId) =>
      Boolean(resolveLarkAccount({ cfg, accountId }).appId)
    );
  },
  noteSetupHelp: noteLarkSetupHelp,
};

/**
 * Group chat message filtering for Lark.
 * Determines whether the bot should respond in group chats.
 */
type LarkMention = {
    key?: string;
    id?: {
        open_id?: string;
        user_id?: string;
    };
    name?: string;
};
/**
 * Check if the bot should respond to a group message.
 * Responds if:
 * - Message contains a question mark
 * - Bot is @mentioned
 * - Message contains bot name aliases
 */
export declare function shouldRespondInGroup(text: string, mentions: LarkMention[], botNames?: string[]): boolean;
export {};
//# sourceMappingURL=group-filter.d.ts.map
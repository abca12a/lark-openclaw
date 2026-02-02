/**
 * Group chat message filtering for Lark.
 * Determines whether the bot should respond in group chats.
 */
/**
 * Check if the bot should respond to a group message.
 * Responds if:
 * - Message contains a question mark
 * - Bot is @mentioned
 * - Message contains bot name aliases
 */
export function shouldRespondInGroup(text, mentions, botNames) {
    // Check for question mark
    if (text.includes("?") || text.includes("？")) {
        return true;
    }
    // Check for @mentions (bot was mentioned)
    if (mentions && mentions.length > 0) {
        return true;
    }
    // Check for bot name aliases
    if (botNames && botNames.length > 0) {
        const lowerText = text.toLowerCase();
        for (const name of botNames) {
            if (lowerText.includes(name.toLowerCase())) {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=group-filter.js.map
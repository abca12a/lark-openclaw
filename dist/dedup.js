/**
 * Message deduplication for Lark.
 * Prevents processing the same message multiple times.
 */
const recentMessageIds = new Set();
const recentEventIds = new Set();
const MAX_CACHE_SIZE = 1000;
const CACHE_TTL_MS = 60_000; // 1 minute
/** Check if a message ID has been seen recently. */
export function isDuplicate(messageId) {
    if (!messageId)
        return false;
    if (recentMessageIds.has(messageId))
        return true;
    recentMessageIds.add(messageId);
    // Cleanup old entries
    if (recentMessageIds.size > MAX_CACHE_SIZE) {
        const iterator = recentMessageIds.values();
        for (let i = 0; i < MAX_CACHE_SIZE / 2; i++) {
            const val = iterator.next().value;
            if (val)
                recentMessageIds.delete(val);
        }
    }
    // Auto-expire after TTL
    setTimeout(() => {
        recentMessageIds.delete(messageId);
    }, CACHE_TTL_MS);
    return false;
}
/** Check if an event ID has been seen recently. */
export function isEventDuplicate(eventId) {
    if (!eventId)
        return false;
    if (recentEventIds.has(eventId))
        return true;
    recentEventIds.add(eventId);
    // Cleanup old entries
    if (recentEventIds.size > MAX_CACHE_SIZE) {
        const iterator = recentEventIds.values();
        for (let i = 0; i < MAX_CACHE_SIZE / 2; i++) {
            const val = iterator.next().value;
            if (val)
                recentEventIds.delete(val);
        }
    }
    // Auto-expire after TTL
    setTimeout(() => {
        recentEventIds.delete(eventId);
    }, CACHE_TTL_MS);
    return false;
}
//# sourceMappingURL=dedup.js.map
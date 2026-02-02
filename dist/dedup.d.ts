/**
 * Message deduplication for Lark.
 * Prevents processing the same message multiple times.
 */
/** Check if a message ID has been seen recently. */
export declare function isDuplicate(messageId: string): boolean;
/** Check if an event ID has been seen recently. */
export declare function isEventDuplicate(eventId: string): boolean;
//# sourceMappingURL=dedup.d.ts.map
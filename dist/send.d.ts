/**
 * Send messages to Lark — text and media.
 */
import type { LarkSendResult } from "./types.js";
import type * as Lark from "@larksuiteoapi/node-sdk";
type LarkClient = Lark.Client;
/**
 * Send a text message to a Lark chat.
 */
export declare function sendTextMessage(client: LarkClient, chatId: string, text: string, replyToId?: string): Promise<LarkSendResult>;
/**
 * Send a media message to a Lark chat.
 */
export declare function sendMediaMessage(client: LarkClient, chatId: string, mediaUrl: string, text?: string, replyToId?: string): Promise<LarkSendResult>;
/**
 * Update an existing message.
 */
export declare function updateMessage(client: LarkClient, messageId: string, text: string): Promise<LarkSendResult>;
/**
 * Delete a message.
 */
export declare function deleteMessage(client: LarkClient, messageId: string): Promise<void>;
export {};
//# sourceMappingURL=send.d.ts.map
/**
 * Send messages to Lark — text and media.
 */
import { cleanupTemp, downloadToTempFile, getFileExtension, getMediaType, uploadFile, uploadImage, } from "./media.js";
/**
 * Send a text message to a Lark chat.
 */
export async function sendTextMessage(client, chatId, text, replyToId) {
    if (!chatId?.trim()) {
        return { ok: false, error: "No chat_id provided" };
    }
    try {
        if (replyToId) {
            const res = await client.im.message.reply({
                path: { message_id: replyToId },
                data: {
                    content: JSON.stringify({ text }),
                    msg_type: "text",
                },
            });
            return { ok: true, messageId: res?.data?.message_id ?? "" };
        }
        const res = await client.im.message.create({
            params: { receive_id_type: "chat_id" },
            data: {
                receive_id: chatId.trim(),
                msg_type: "text",
                content: JSON.stringify({ text }),
            },
        });
        return { ok: true, messageId: res?.data?.message_id ?? "" };
    }
    catch (err) {
        return {
            ok: false,
            error: err instanceof Error ? err.message : String(err),
        };
    }
}
/**
 * Send a media message to a Lark chat.
 */
export async function sendMediaMessage(client, chatId, mediaUrl, text, replyToId) {
    if (!chatId?.trim()) {
        return { ok: false, error: "No chat_id provided" };
    }
    if (!mediaUrl?.trim()) {
        return { ok: false, error: "No media URL provided" };
    }
    let tempPath = null;
    let isTemp = false;
    try {
        const downloaded = await downloadToTempFile(mediaUrl);
        tempPath = downloaded.path;
        isTemp = downloaded.isTemp;
        const mediaType = getMediaType(mediaUrl);
        const extension = getFileExtension(mediaUrl);
        const filename = `file_${Date.now()}.${extension}`;
        let msgType;
        let content;
        if (mediaType === "image") {
            const imageKey = await uploadImage(client, tempPath);
            msgType = "image";
            content = JSON.stringify({ image_key: imageKey });
        }
        else if (mediaType === "video") {
            const fileKey = await uploadFile(client, tempPath, filename, "mp4");
            msgType = "media";
            content = JSON.stringify({ file_key: fileKey });
        }
        else if (mediaType === "audio") {
            const fileKey = await uploadFile(client, tempPath, filename, "opus");
            msgType = "audio";
            content = JSON.stringify({ file_key: fileKey });
        }
        else {
            const fileKey = await uploadFile(client, tempPath, filename, "stream");
            msgType = "file";
            content = JSON.stringify({ file_key: fileKey });
        }
        // Send the media message
        if (replyToId) {
            await client.im.message.reply({
                path: { message_id: replyToId },
                data: { content, msg_type: msgType },
            });
        }
        else {
            await client.im.message.create({
                params: { receive_id_type: "chat_id" },
                data: { receive_id: chatId.trim(), content, msg_type: msgType },
            });
        }
        // Send text as separate message if provided
        if (text?.trim()) {
            await client.im.message.create({
                params: { receive_id_type: "chat_id" },
                data: {
                    receive_id: chatId.trim(),
                    content: JSON.stringify({ text }),
                    msg_type: "text",
                },
            });
        }
        return { ok: true };
    }
    catch (err) {
        // Fallback: send as text with URL
        try {
            const fallbackText = text ? `${text}\n${mediaUrl}` : mediaUrl;
            const res = await client.im.message.create({
                params: { receive_id_type: "chat_id" },
                data: {
                    receive_id: chatId.trim(),
                    content: JSON.stringify({ text: fallbackText }),
                    msg_type: "text",
                },
            });
            return { ok: true, messageId: res?.data?.message_id ?? "" };
        }
        catch {
            return {
                ok: false,
                error: err instanceof Error ? err.message : String(err),
            };
        }
    }
    finally {
        if (tempPath)
            cleanupTemp(tempPath, isTemp);
    }
}
/**
 * Update an existing message.
 */
export async function updateMessage(client, messageId, text) {
    try {
        await client.im.message.update({
            path: { message_id: messageId },
            data: {
                msg_type: "text",
                content: JSON.stringify({ text }),
            },
        });
        return { ok: true, messageId };
    }
    catch (err) {
        return {
            ok: false,
            error: err instanceof Error ? err.message : String(err),
        };
    }
}
/**
 * Delete a message.
 */
export async function deleteMessage(client, messageId) {
    try {
        await client.im.message.delete({
            path: { message_id: messageId },
        });
    }
    catch {
        // Best-effort cleanup
    }
}
//# sourceMappingURL=send.js.map
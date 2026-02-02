/**
 * Media upload/download helpers for Lark.
 */
import type { LarkMediaType } from "./types.js";
import type * as Lark from "@larksuiteoapi/node-sdk";
type LarkClient = Lark.Client;
/** Detect media type from URL or mime type. */
export declare function getMediaType(url: string, mimeType?: string): LarkMediaType;
/** Extract file extension from a URL. */
export declare function getFileExtension(url: string): string;
/** Download a URL to a temporary file. Returns path and cleanup flag. */
export declare function downloadToTempFile(url: string): Promise<{
    path: string;
    isTemp: boolean;
}>;
/** Upload an image to Lark and return the image_key. */
export declare function uploadImage(client: LarkClient, filePath: string): Promise<string>;
/** Upload a file to Lark and return the file_key. */
export declare function uploadFile(client: LarkClient, filePath: string, filename: string, fileType?: "stream" | "opus" | "mp4" | "pdf" | "doc" | "xls" | "ppt"): Promise<string>;
/** Clean up a temp file. */
export declare function cleanupTemp(filePath: string, isTemp: boolean): void;
export {};
//# sourceMappingURL=media.d.ts.map
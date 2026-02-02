/**
 * Media upload/download helpers for Lark.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import https from "node:https";
import http from "node:http";
import type { LarkMediaType } from "./types.js";
import type * as Lark from "@larksuiteoapi/node-sdk";

// Use Lark SDK Client type
type LarkClient = Lark.Client;

/** Detect media type from URL or mime type. */
export function getMediaType(url: string, mimeType?: string): LarkMediaType {
  const urlLower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(urlLower)) return "image";
  if (/\.(mp4|mov|avi|mkv|webm)(\?|$)/i.test(urlLower)) return "video";
  if (/\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(urlLower)) return "audio";
  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
  }
  return "file";
}

/** Extract file extension from a URL. */
export function getFileExtension(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
  return match ? match[1].toLowerCase() : "bin";
}

/** Download a URL to a temporary file. Returns path and cleanup flag. */
export async function downloadToTempFile(
  url: string
): Promise<{ path: string; isTemp: boolean }> {
  // Local file reference
  if (url.startsWith("/") || url.startsWith("file://")) {
    const filePath = url.replace("file://", "");
    return { path: filePath, isTemp: false };
  }

  const extension = getFileExtension(url);
  const tempPath = path.join(os.tmpdir(), `lark_${Date.now()}.${extension}`);

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(tempPath);

    protocol
      .get(url, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close();
          try { fs.unlinkSync(tempPath); } catch { /* ignore */ }
          const location = response.headers.location;
          if (!location) {
            reject(new Error("Redirect without location header"));
            return;
          }
          downloadToTempFile(location).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          try { fs.unlinkSync(tempPath); } catch { /* ignore */ }
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve({ path: tempPath, isTemp: true });
        });
        file.on("error", (err) => {
          try { fs.unlinkSync(tempPath); } catch { /* ignore */ }
          reject(err);
        });
      })
      .on("error", (err) => {
        file.close();
        try { fs.unlinkSync(tempPath); } catch { /* ignore */ }
        reject(err);
      });
  });
}

/** Upload an image to Lark and return the image_key. */
export async function uploadImage(
  client: LarkClient,
  filePath: string
): Promise<string> {
  const response = (await client.im.image.create({
    data: {
      image_type: "message",
      image: fs.createReadStream(filePath),
    },
  })) as { image_key?: string; data?: { image_key?: string } };

  const imageKey = response.image_key ?? response.data?.image_key;
  if (!imageKey) {
    throw new Error(`Upload image failed: ${JSON.stringify(response)}`);
  }
  return imageKey;
}

/** Upload a file to Lark and return the file_key. */
export async function uploadFile(
  client: LarkClient,
  filePath: string,
  filename: string,
  fileType: "stream" | "opus" | "mp4" | "pdf" | "doc" | "xls" | "ppt" = "stream"
): Promise<string> {
  const response = (await client.im.file.create({
    data: {
      file_type: fileType,
      file_name: filename,
      file: fs.createReadStream(filePath),
    },
  })) as { file_key?: string; data?: { file_key?: string } };

  const fileKey = response.file_key ?? response.data?.file_key;
  if (!fileKey) {
    throw new Error(`Upload file failed: ${JSON.stringify(response)}`);
  }
  return fileKey;
}

/** Clean up a temp file. */
export function cleanupTemp(filePath: string, isTemp: boolean): void {
  if (isTemp) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      /* ignore */
    }
  }
}

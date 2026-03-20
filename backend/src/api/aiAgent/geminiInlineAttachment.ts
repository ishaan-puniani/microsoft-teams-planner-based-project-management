import { Buffer } from 'buffer';

/** MIME types Gemini accepts as inlineData for planner/suggestion flows. */
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

/** Max decoded binary size (Gemini / payload safety). */
const MAX_BINARY_BYTES = 15 * 1024 * 1024;

export type GeminiInlineData = { mimeType: string; data: string };

/**
 * Optional JSON body fields: attachmentBase64 (raw or data URL), attachmentMimeType.
 * When either is omitted/empty, no attachment is sent.
 */
export function parseOptionalPlannerAttachment(body: Record<string, unknown>):
  | { inlineData: GeminiInlineData | null; error?: never }
  | { inlineData?: never; error: Error } {
  const mimeField =
    typeof body.attachmentMimeType === 'string'
      ? body.attachmentMimeType.trim().toLowerCase()
      : '';
  let raw =
    typeof body.attachmentBase64 === 'string' ? body.attachmentBase64.trim() : '';

  if (!raw && !mimeField) {
    return { inlineData: null };
  }

  let mimeType = mimeField;
  let base64Payload = raw.replace(/\s/g, '');

  if (raw.startsWith('data:')) {
    const sep = ';base64,';
    const i = raw.indexOf(sep);
    if (i !== -1) {
      mimeType = raw.slice(5, i).trim().toLowerCase();
      base64Payload = raw.slice(i + sep.length).replace(/\s/g, '');
    }
  }

  if (!base64Payload) {
    return { error: new Error('attachmentBase64 is required when attaching a file') };
  }
  if (!mimeType) {
    return { error: new Error('attachmentMimeType is required when attaching a file') };
  }
  if (!ALLOWED_MIME.has(mimeType)) {
    return {
      error: new Error(
        `attachment must be PDF or image (allowed MIME: ${[...ALLOWED_MIME].join(', ')})`,
      ),
    };
  }

  let buf: Buffer;
  try {
    buf = Buffer.from(base64Payload, 'base64');
  } catch {
    return { error: new Error('attachmentBase64 is not valid base64') };
  }
  if (!buf.length) {
    return { error: new Error('Attachment is empty') };
  }
  if (buf.length > MAX_BINARY_BYTES) {
    return {
      error: new Error(
        `Attachment exceeds maximum size (${Math.floor(MAX_BINARY_BYTES / (1024 * 1024))} MB)`,
      ),
    };
  }

  return { inlineData: { mimeType, data: base64Payload } };
}

export function buildGeminiUserParts(
  text: string,
  inlineData: GeminiInlineData | null,
): Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> {
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    { text },
  ];
  if (inlineData) {
    parts.push({
      inlineData: { mimeType: inlineData.mimeType, data: inlineData.data },
    });
  }
  return parts;
}

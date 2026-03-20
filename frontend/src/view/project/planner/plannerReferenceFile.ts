import type { AiSuggestionAttachment } from 'src/modules/aiAgent/aiAgentService';

export type PlannerReferenceFile = AiSuggestionAttachment & { name: string };

export function readPlannerReferenceFile(file: File): Promise<PlannerReferenceFile> {
  return new Promise((resolve, reject) => {
    const ok =
      file.type === 'application/pdf' || file.type.startsWith('image/');
    if (!ok) {
      reject(new Error('Please choose a PDF or image file.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const comma = dataUrl.indexOf(',');
      const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
      resolve({
        attachmentBase64: base64,
        attachmentMimeType: file.type,
        name: file.name,
      });
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

export function toAttachmentPayload(
  file: PlannerReferenceFile | null,
): AiSuggestionAttachment | undefined {
  if (!file) return undefined;
  return {
    attachmentBase64: file.attachmentBase64,
    attachmentMimeType: file.attachmentMimeType,
  };
}

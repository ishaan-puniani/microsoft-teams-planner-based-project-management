import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';

// Skip TLS verification for outbound Gemini call only (fixes "unable to get local issuer certificate" in dev/proxy setups)
const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const QUICK_FORMAT_EXAMPLE = `title task 1
description task 1
-list item 1
-list item 2

title task 2
description task 2
-task 2 list item 1
-task 2 list item 2`;

const SYSTEM_PROMPT = `You are a meeting assistant. Given a transcript (meeting notes, call transcript, or similar text), extract actionable TASKS and BUGS.

Output MUST follow this exact format. Each task is a block of lines separated by a blank line:

Line 1: task title (short, actionable)
Line 2: task description (one line, can be empty)
Line 3+: checklist items, each line starting with a single hyphen and space "- "

Example output:
${QUICK_FORMAT_EXAMPLE}

Rules:
- One task per block. Separate blocks with exactly one blank line.
- Title: concise, start with a verb when possible (e.g. "Fix login redirect", "Add validation for email").
- Description: optional one-line context.
- Checklist: optional; each item on its own line, prefix with "- ".
- Prefer multiple small tasks over one huge task.
- If the transcript mentions bugs, create a task per bug with title like "Bug: ..." or "Fix ...".
- Output ONLY the task blocks in the format above, no other commentary or markdown.`;

export default async function createTasksFromTranscript(req, res, next) {
  try {
    const { transcript } = req.body || {};
    if (!transcript || typeof transcript !== 'string') {
      return ApiResponseHandler.error(req, res, new Error('transcript (string) is required in request body'));
    }

    const apiKey = getConfig().GEMINI_API_KEY || getConfig().GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY must be set in environment'),
      );
    }

    // Model: gemini-2.0-flash (or set GEMINI_MODEL=gemini-pro for legacy)
    const model = getConfig().GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const prompt = `${SYSTEM_PROMPT}\n\n---\n\nTranscript:\n\n${transcript}`;

    const response = await axios.post(
      url,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: geminiHttpsAgent,
        timeout: 60000,
      },
    );

    const data = response.data;
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    await ApiResponseHandler.success(req, res, { tasksText: text });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errData = error.response?.data;
      const errMsg = typeof errData === 'string' ? errData : JSON.stringify(errData || error.message).slice(0, 200);
      console.error('Gemini API error:', status, errMsg);
      return ApiResponseHandler.error(
        req,
        res,
        new Error(`Gemini API error: ${status || error.code} - ${errMsg}`),
      );
    }
    await ApiResponseHandler.error(req, res, error);
  }
}

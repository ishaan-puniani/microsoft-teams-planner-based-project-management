import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const SYSTEM = `You are a QA assistant. Given a Task (title and optional description), suggest test cases.

Output valid JSON only, no markdown or preamble. Format:
[
  { "title": "Test case title", "steps": "Step 1. Do X.\\nStep 2. Do Y.", "expectedResult": "Expected outcome." },
  ...
]
- 2-6 test cases.
- title: short descriptive title.
- steps: numbered or bullet steps, newline-separated.
- expectedResult: what should happen.`;

export default async function suggestTestCasesForTask(req, res, next) {
  try {
    const body = req.body || {};
    const taskTitle =
      typeof body.taskTitle === 'string' ? body.taskTitle.trim() : '';
    const taskDescription =
      typeof body.taskDescription === 'string' ? body.taskDescription.trim() : '';

    if (!taskTitle) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('taskTitle (string) is required'),
      );
    }

    const apiKey = getConfig().GEMINI_API_KEY || getConfig().GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY must be set in environment'),
      );
    }

    const model = getConfig().GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const taskBlock = taskDescription
      ? `Task: ${taskTitle}\n${taskDescription}`
      : `Task: ${taskTitle}`;
    const userPrompt = `${taskBlock}\n\nOutput test cases as JSON array with title, steps, expectedResult.`;

    const response = await axios.post(
      url,
      {
        contents: [{ role: 'user', parts: [{ text: `${SYSTEM}\n\n---\n\n${userPrompt}` }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: geminiHttpsAgent,
        timeout: 30000,
      },
    );

    const data = response.data;
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    const cleaned = rawText.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    let testCases: Array<{ title?: string; steps?: string; expectedResult?: string }> = [];
    try {
      const parsed = JSON.parse(cleaned);
      testCases = Array.isArray(parsed) ? parsed : [];
    } catch {
      testCases = [];
    }
    const normalized = testCases
      .filter((t) => t && (t.title || t.steps || t.expectedResult))
      .map((t) => ({
        title: typeof t.title === 'string' ? t.title.trim() : 'Test case',
        steps: typeof t.steps === 'string' ? t.steps.trim() : '',
        expectedResult: typeof t.expectedResult === 'string' ? t.expectedResult.trim() : '',
      }));

    await ApiResponseHandler.success(req, res, { testCases: normalized });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errData = error.response?.data;
      const errMsg =
        typeof errData === 'string'
          ? errData
          : JSON.stringify(errData || error.message).slice(0, 200);
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

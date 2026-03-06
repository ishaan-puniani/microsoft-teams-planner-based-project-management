import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const SYSTEM = `You are a product owner assistant. You will receive a Task (title and optional description).

Your task: Output a short TODO checklist for this task. Rules:
- Output plain text only. No markdown, no preamble.
- Each line must start with "- " (dash space) then the todo item.
- 2-6 concrete, actionable items (e.g. "Add validation", "Write unit tests").
- One item per line.`;

export default async function plannerSuggestTodosForTask(req, res, next) {
  try {
    const body = req.body || {};
    const taskTitle =
      typeof body.taskTitle === 'string' ? body.taskTitle.trim() : '';
    const taskDescription =
      typeof body.taskDescription === 'string' ? body.taskDescription.trim() : '';
    const projectBrief =
      typeof body.projectBrief === 'string' ? body.projectBrief.trim() : '';
    const userStoryTitle =
      typeof body.userStoryTitle === 'string' ? body.userStoryTitle.trim() : '';

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
    const context = projectBrief ? `Project: ${projectBrief.slice(0, 200)}\n\n` : '';
    const storyContext = userStoryTitle ? `User story: ${userStoryTitle}\n\n` : '';
    const taskBlock = taskDescription
      ? `Task: ${taskTitle}\n${taskDescription}`
      : `Task: ${taskTitle}`;
    const userPrompt = `${context}${storyContext}${taskBlock}\n\nOutput a TODO checklist (each line starting with "- ").`;
    const fullPrompt = `${SYSTEM}\n\n---\n\n${userPrompt}`;

    const response = await axios.post(
      url,
      {
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
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
    // Normalize: ensure each line starts with "- " and strip any existing dash/bullet
    const todos = rawText
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^[-*]\s*/, ''));

    await ApiResponseHandler.success(req, res, { todos });
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

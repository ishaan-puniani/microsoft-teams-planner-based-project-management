import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';
import ProjectRepository from '../../database/repositories/projectRepository';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const SYSTEM = `You are a product owner assistant. You will receive:
1. The project description (optional)
2. The epic name (optional)
3. One User Story with its Acceptance Criteria

Your task: For this user story ONLY, add Tasks. Output structure:

- User Story title
Description and AC (keep as given).

-- Task title (starts with "-- ")
Optional task description.
Optional TODO checklist:
TODO:
- Todo item 1
- Todo item 2

-- Next Task
...

Rules:
- Output plain text only. No markdown, no preamble.
- Keep the user story block (title, description, AC) exactly as in the input. Only ADD "-- Task" blocks.
- Add 1-4 tasks per user story. Each task has an optional description. A "TODO:" list with "- item" lines is optional per task (include only when it clearly helps; users can add TODOs later).
- Use "--- Subtask" only if a task clearly has sub-items.`;

export default async function plannerSuggestTasksForUserStory(req, res, next) {
  try {
    const body = req.body || {};
    const projectId = body.projectId || req.projectId;
    let projectDescription;
    if (projectId) {
      const project = await ProjectRepository.findById(projectId, req);
      projectDescription = project?.description;
    }
    const projectBrief =
      typeof body.projectBrief === 'string' ? body.projectBrief.trim() : '';
    const epicName =
      typeof body.epicName === 'string' ? body.epicName.trim() : '';
    const userStoryText =
      typeof body.userStoryText === 'string' ? body.userStoryText.trim() : '';

    if (!userStoryText) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('userStoryText (string) is required'),
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
    const projectContext = [projectDescription, projectBrief].filter(Boolean).join('\n\n');
    const context = projectContext
      ? `Project description:\n\n${projectContext}\n\n`
      : '';
    const epicContext = epicName ? `Epic: ${epicName}\n\n` : '';
    const userPrompt = `${context}${epicContext}User story:\n\n${userStoryText}\n\nAdd tasks for this user story only. Each task may have an optional description and optional TODO checklist. Output the full block (user story + tasks).`;
    const fullPrompt = `${SYSTEM}\n\n---\n\n${userPrompt}`;

    const response = await axios.post(
      url,
      {
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.3,
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
    const tasksText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    await ApiResponseHandler.success(req, res, { tasksText });
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

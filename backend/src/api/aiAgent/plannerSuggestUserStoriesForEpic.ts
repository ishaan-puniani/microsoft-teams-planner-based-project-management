import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';
import ProjectRepository from '../../database/repositories/projectRepository';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const SYSTEM = `You are a product owner assistant. You will receive:
1. The project description (optional)
2. One EPIC name/title

Your task: For this epic ONLY, output User Stories with Acceptance Criteria. Output structure:

Epic Title
Optional short description.

- User Story title (one line, starts with "- ")
Description line(s) if needed.
AC:
- Acceptance criterion 1
- Acceptance criterion 2

- Next User Story
...

Rules:
- Output plain text only. No markdown, no preamble.
- Keep the exact epic title as the first line. Under it, add 2-5 user stories.
- Each user story: one line starting with "- ". Then optional description. Then "AC:" and lines "- item" for acceptance criteria.
- Do NOT add "-- Task" or "TODO:" yet. Only epic header and user stories with AC.`;

export default async function plannerSuggestUserStoriesForEpic(req, res, next) {
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
    const epicDescription =
      typeof body.epicDescription === 'string' ? body.epicDescription.trim() : '';

    if (!epicName) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('epicName (string) is required'),
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
    const epicBlock = epicDescription
      ? `Epic: ${epicName}\n${epicDescription}`
      : `Epic: ${epicName}`;
    const userPrompt = `${context}${epicBlock}\n\nOutput user stories with AC for this epic only (plain text: epic title first line, then "- User Story" lines and "AC:" blocks). No tasks.`;
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
    const userStoriesText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    await ApiResponseHandler.success(req, res, { userStoriesText });
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

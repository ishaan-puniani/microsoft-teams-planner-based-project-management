import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';
import ProjectRepository from '../../database/repositories/projectRepository';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const SYSTEM = `You are a product owner assistant. Given a project description, output ONLY a list of EPICS (one per module or major area).

Rules:
- Output plain text only. No markdown, no numbering, no preamble.
- Each epic is one line with NO leading dash. Optionally add one description line below it (no dash).
- One blank line between epics.
- Break the project into multiple epics (e.g. Authentication, Product Catalog, Cart & Checkout). Do NOT output a single epic.
- Epic titles should be module/area names (2-4 words).`;

export default async function plannerSuggestEpics(req, res, next) {

  const projectId = req.body.projectId || req.projectId;
  let projectDescription;
  if(projectId){
    const project = await ProjectRepository.findById(projectId, req);
    projectDescription = project.description;
  }

  try {
    const body = req.body || {};
    const projectBrief =
      typeof body.projectBrief === 'string' ? body.projectBrief.trim() : '';

    const projectContext = [projectDescription, projectBrief].filter(Boolean).join('\n\n');
    if (!projectContext) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('projectBrief (string) or project description (via projectId) is required'),
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
    const userPrompt = `Project description:\n\n${projectContext}\n\nOutput the list of epics only (one per line, no leading dash, optional description line under each).`;
    const fullPrompt = `${SYSTEM}\n\n---\n\n${userPrompt}`;

    const response = await axios.post(
      url,
      {
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: geminiHttpsAgent,
        timeout: 60000,
      },
    );

    const data = response.data;
    const epicsText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    await ApiResponseHandler.success(req, res, { epicsText });
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

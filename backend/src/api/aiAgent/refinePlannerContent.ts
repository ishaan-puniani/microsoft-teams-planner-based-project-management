import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

type PlannerStep = 'epics' | 'user_stories' | 'tasks';

const STEP_EPICS_SYSTEM = `You are a product owner assistant. Given a project description, output ONLY a list of EPICS (one per module or major area).

Rules:
- Output plain text only. No markdown, no numbering, no preamble.
- Each epic is one line with NO leading dash. Optionally add one description line below it (no dash).
- One blank line between epics.
- Break the project into multiple epics (e.g. Authentication, Product Catalog, Cart & Checkout). Do NOT output a single epic.
- Epic titles should be module/area names (2-4 words).`;

const STEP_USER_STORIES_SYSTEM = `You are a product owner assistant. You will receive:
1. The project description
2. The agreed list of EPICS (each line is an epic title, no leading dash)

Your task: For EACH epic, add User Stories with Acceptance Criteria. Output structure:

Epic Title
Optional short description.

- User Story title (one line, starts with "- ")
Description line(s) if needed.
AC:
- Acceptance criterion 1
- Acceptance criterion 2

- Next User Story
...

(blank line, then next Epic)

Rules:
- Output plain text only. No markdown, no preamble.
- Keep the exact epic titles from the input. Under each epic, add 2-5 user stories.
- Each user story: one line starting with "- ". Then optional description. Then "AC:" and lines "- item" for acceptance criteria.
- Do NOT add "-- Task" or "TODO:" yet. Only epics and user stories with AC.`;

const STEP_TASKS_SYSTEM = `You are a product owner assistant. You will receive:
1. The project description
2. The agreed content: Epics and User Stories (with AC). No tasks yet.

Your task: For each user story, add Tasks with TODO checklists. Output the FULL structured text:

Epic Title
Description.

- User Story
Description.
AC:
- Criterion 1

-- Task title (starts with "-- ")
Task description.
TODO:
- Todo item 1
- Todo item 2

-- Next Task
...

(Then next user story, then next epic.)

Rules:
- Output plain text only. No markdown, no preamble.
- Keep all existing epics and user stories (and their AC) exactly. Only ADD "-- Task" blocks and "TODO:" lists.
- Under each user story, add 1-4 tasks. Each task has optional description then "TODO:" and "- item" lines.
- Use "--- Subtask" only if a task clearly has sub-items.`;

function buildPromptForStep(
  step: PlannerStep,
  projectBrief: string,
  currentText: string,
  userFeedback?: string,
): string {
  const feedback = userFeedback?.trim() ? `\n\nUser feedback (apply this): ${userFeedback}` : '';

  if (step === 'epics') {
    return `Project description:\n\n${projectBrief}${feedback}\n\nOutput the list of epics only (one per line, no leading dash, optional description line under each).`;
  }

  if (step === 'user_stories') {
    return `Project description:\n\n${projectBrief}\n\nAgreed epics:\n\n${currentText}${feedback}\n\nFor each epic above, add user stories with AC. Output the full text (epics + user stories with AC). No tasks yet.`;
  }

  // step === 'tasks'
  return `Project description:\n\n${projectBrief}\n\nCurrent content (epics + user stories, no tasks yet):\n\n${currentText}${feedback}\n\nAdd tasks with TODO lists under each user story. Output the complete structured text (epics + stories + tasks).`;
}

function getSystemPromptForStep(step: PlannerStep): string {
  if (step === 'epics') return STEP_EPICS_SYSTEM;
  if (step === 'user_stories') return STEP_USER_STORIES_SYSTEM;
  return STEP_TASKS_SYSTEM;
}

export default async function refinePlannerContent(req, res, next) {
  try {
    const body = req.body || {};
    const step = ['epics', 'user_stories', 'tasks'].includes(body.step)
      ? body.step
      : 'epics';
    const projectBrief =
      typeof body.projectBrief === 'string' ? body.projectBrief.trim() : '';
    const currentStructuredText =
      typeof body.currentStructuredText === 'string'
        ? body.currentStructuredText
        : '';
    const userFeedback =
      typeof body.userFeedback === 'string' ? body.userFeedback.trim() : undefined;

    if (!projectBrief && step === 'epics') {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('projectBrief (string) is required for step epics'),
      );
    }

    if (step !== 'epics' && !currentStructuredText.trim()) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error(
          'currentStructuredText is required for steps user_stories and tasks',
        ),
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
    const systemPrompt = getSystemPromptForStep(step);
    const userPrompt = buildPromptForStep(
      step,
      projectBrief,
      currentStructuredText,
      userFeedback,
    );
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

    const response = await axios.post(
      url,
      {
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
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

    await ApiResponseHandler.success(req, res, {
      structuredText: text,
      step,
    });
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

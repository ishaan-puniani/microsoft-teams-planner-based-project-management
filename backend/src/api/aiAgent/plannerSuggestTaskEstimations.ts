import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';
import ProjectRepository from '../../database/repositories/projectRepository';
import TaskRepository from '../../database/repositories/taskRepository';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const ROLES = ['architect', 'developer', 'tester', 'businessAnalyst', 'ux', 'pm'] as const;
type RoleKey = (typeof ROLES)[number];
type EstimatesByRole = Record<RoleKey, number>;

const SYSTEM = `You are a project estimation assistant. Given a project context, team skill levels, and a task, output time estimates in hours per role.

Rules:
- Output valid JSON only. No markdown, no preamble, no code fence.
- Structure: { "low": { "architect": n, "developer": n, ... }, "ideal": { ... }, "high": { ... } }
- Each of low, ideal, high is an object with keys: architect, developer, tester, businessAnalyst, ux, pm.
- Values are numbers: hours of work for that role to complete the task. Use 0 for roles not needed (e.g. no UI work => ux: 0; backend-only => ux: 0).
- low = optimistic, ideal = expected, high = pessimistic.
- Consider project description and task type: some tasks need only a subset of roles (e.g. backend task may need developer, architect, tester; UX can be 0).
- Team skill level: if a role is undefined or "MEDIUM", treat as average. If a role is "LOW", estimates may be higher; "HIGH" may be lower. Unallocated / missing roles are out of team for this project (you can still suggest hours if that role would be needed).`;

function normalizeEstimates(obj: Record<string, unknown> | null): EstimatesByRole {
  const out: EstimatesByRole = {
    architect: 0,
    developer: 0,
    tester: 0,
    businessAnalyst: 0,
    ux: 0,
    pm: 0,
  };
  if (!obj || typeof obj !== 'object') return out;
  for (const key of ROLES) {
    const v = obj[key];
    if (typeof v === 'number' && v >= 0) out[key] = v;
  }
  return out;
}

export default async function plannerSuggestEstimatesOfTask(req, res, next) {
  const projectId = req.params.projectId;
  const taskId = req.params.taskId;

  try {
    const project = await ProjectRepository.findById(projectId, req);
    const projectDescription = project?.description ?? '';
    const teamSkillLevel = project?.teamSkillLevel ?? {};

    const task = await TaskRepository.findById(taskId, req);
    const taskType = task?.type ?? '';
    const title = task?.title ?? '';
    const description = task?.description ?? '';
    const acceptanceCriteria = task?.acceptanceCriteria ?? '';

    const apiKey = getConfig().GEMINI_API_KEY || getConfig().GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY must be set in environment'),
      );
    }

    const skillDesc = Object.entries(teamSkillLevel)
      .filter(([, v]) => v != null)
      .map(([role, level]) => `${role}: ${level}`)
      .join(', ') || 'all roles: average (undefined treated as average; unallocated = out of team)';

    const userPrompt = `Project description:\n${projectDescription || '(none)'}\n\nTeam skill level: ${skillDesc}\n\nTask type: ${taskType}\nTask title: ${title}\nTask description: ${description || '(none)'}\nAcceptance criteria: ${acceptanceCriteria || '(none)'}\n\nOutput JSON with low, ideal, high; each an object with architect, developer, tester, businessAnalyst, ux, pm (hours). Use 0 for roles not needed for this task.`;

    const model = getConfig().GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await axios.post(
      url,
      {
        contents: [{ role: 'user', parts: [{ text: `${SYSTEM}\n\n---\n\n${userPrompt}` }] }],
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

    const rawText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    const cleaned = rawText.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

    let parsed: { low?: unknown; ideal?: unknown; high?: unknown };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('AI returned invalid JSON for estimates'),
      );
    }

    const suggestedEstimatedTime = {
      low: normalizeEstimates(parsed.low as Record<string, unknown>),
      ideal: normalizeEstimates(parsed.ideal as Record<string, unknown>),
      high: normalizeEstimates(parsed.high as Record<string, unknown>),
    };

    await TaskRepository.update(
      taskId,
      { suggestedEstimatedTime },
      req,
    );

    await ApiResponseHandler.success(req, res, { suggestedEstimatedTime });
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

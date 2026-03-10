import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';
import TaskRepository from '../../database/repositories/taskRepository';

const geminiHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const SYSTEM_PARENT = `You are a product owner assistant. You will receive:
1. A list of User Stories with their IDs and titles (and optional epic context).
2. One task (title, optional description, optional categories).

Your task: Decide which single User Story this task best belongs to, or respond with NONE if it does not clearly fit any.

Rules:
- Output ONLY the User Story ID in quotes (e.g. "507f1f77bcf86cd799439011") if you have a clear match.
- Output exactly the string NONE (no quotes) if the task does not clearly belong to any of the given user stories.
- No other text, no explanation, no markdown.`;

const SYSTEM_TYPE = `You are a product owner assistant. You will receive one task (title, optional description, optional categories).

Your task: Classify the task type as TASK or BUG.
- Use BUG for defects, fixes, "something broken", bugs, issues.
- Use TASK for features, work items, or neutral/uncertain items.

Output exactly one word: either TASK or BUG. No other text, no explanation, no markdown.`;

export default async function organizeTasksInPorject(
  req,
  res,
  next,
) {
  try {
    const projectId = req.params.projectId;
    const options = { ...req };

    const [epicsAndUserStories, tasksWithoutParent] =
      await Promise.all([
        TaskRepository.getEpicsAndUserStories(
          projectId,
          options,
        ),
        TaskRepository.getTasksWithoutParentOrTypeAndNotEpicOrUserStory(
          projectId,
          options,
        ),
      ]);

    if (epicsAndUserStories.length === 0) {
      return ApiResponseHandler.success(req, res, {
        message:
          'No epics or user stories found in this project',
        updated: 0,
        skipped: tasksWithoutParent.length,
      });
    }

    if (tasksWithoutParent.length === 0) {
      return ApiResponseHandler.success(req, res, {
        message: 'No unparented tasks to organize',
        updated: 0,
        skipped: 0,
      });
    }

    const apiKey =
      getConfig().GEMINI_API_KEY ||
      getConfig().GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error(
          'GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY must be set in environment',
        ),
      );
    }

    const model =
      getConfig().GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const userStoriesBlock = epicsAndUserStories
      .map(
        (us) =>
          `- ID: "${us.id}" | Title: ${us.title}${us.epicTitle ? ` (Epic: ${us.epicTitle})` : ''}`,
      )
      .join('\n');

    const geminiCall = async (
      prompt: string,
      maxTokens = 64,
    ) => {
      const response = await axios.post(
        url,
        {
          contents: [
            { role: 'user', parts: [{ text: prompt }] },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: maxTokens,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          httpsAgent: geminiHttpsAgent,
          timeout: 15000,
        },
      );
      return (
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        ''
      );
    };

    let updatedParent = 0;
    let updatedType = 0;
    let tasksUpdated = 0;
    for (
      let idx = 0;
      idx < tasksWithoutParent.length;
      idx++
    ) {
      console.log(
        `Analysizing ${idx} out of ${tasksWithoutParent.length}`,
      );
      const task = tasksWithoutParent[idx];
      const taskBlock = [
        `Title: ${task.title}`,
        task.description
          ? `Description: ${task.description}`
          : '',
        task.categories?.length
          ? `Categories: ${task.categories.join(', ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      let suggestedId: string | null = null;
      let suggestedType: 'TASK' | 'BUG' | null = null;

      try {
        const parentPrompt = `${SYSTEM_PARENT}\n\n---\n\nUser Stories:\n${userStoriesBlock}\n\nTask:\n${taskBlock}\n\nOutput only the User Story ID in quotes, or NONE.`;
        const parentText = await geminiCall(parentPrompt);
        const normalizedParent = parentText
          .toUpperCase()
          .trim();
        if (normalizedParent !== 'NONE') {
          const match = parentText.match(/"([^"]+)"/);
          if (match) {
            const id = match[1].trim();
            if (
              epicsAndUserStories.some((us) => us.id === id)
            ) {
              suggestedId = id;
            }
          }
        }
      } catch {
        // leave suggestedId null
      }

      try {
        const typePrompt = `${SYSTEM_TYPE}\n\n---\n\nTask:\n${taskBlock}\n\nOutput exactly one word: TASK or BUG.`;
        const typeText = await geminiCall(typePrompt);
        const t = typeText.toUpperCase().trim();
        if (t === 'BUG') suggestedType = 'BUG';
        else if (t === 'TASK') suggestedType = 'TASK';
      } catch {
        // leave suggestedType null
      }

      const updates: {
        parents?: string[];
        type?: 'TASK' | 'BUG';
      } = {};
      if (suggestedId) {
        updates.parents = [suggestedId];
        updatedParent += 1;
      }
      if (suggestedType) {
        updates.type = suggestedType;
        updatedType += 1;
      }
      if (Object.keys(updates).length > 0) {
        await TaskRepository.update(
          task.id,
          updates,
          options,
        );
        tasksUpdated += 1;
      }
    }

    await ApiResponseHandler.success(req, res, {
      message: `Organized: ${updatedParent} task(s) linked to a user story, ${updatedType} task(s) had type set (TASK/BUG). Type is set even when no parent is suggested.`,
      updated: updatedParent,
      updatedType,
      tasksUpdated,
      skipped: tasksWithoutParent.length - tasksUpdated,
    });
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
}

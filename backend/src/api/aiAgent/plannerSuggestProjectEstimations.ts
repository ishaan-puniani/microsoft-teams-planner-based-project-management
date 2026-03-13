import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';
import ProjectRepository from '../../database/repositories/projectRepository';
import TaskRepository from '../../database/repositories/taskRepository';
import { estimateTask } from '../../services/aiAgent/taskService';

export default async function plannerSuggestEstimatesOfTask(req, res, next) {
  const projectId = req.params.projectId;

  try {
    const project = await ProjectRepository.findById(projectId, req);
    const projectDescription = project?.description ?? '';
    const teamSkillLevel = project?.teamSkillLevel ?? {};

    const apiKey = getConfig().GEMINI_API_KEY || getConfig().GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY must be set in environment'),
      );
    }

    const tasks = await TaskRepository.getEpicsAndUserStoriesWithoutEstimates(
      projectId,
      req,
    );

    const results: Array<{
      taskId: string;
      title: string;
      type: string;
      suggestedEstimatedTime: Record<string, unknown>;
    }> = [];

    for (const task of tasks) {
      const suggestedEstimatedTime = await estimateTask({
        projectDescription,
        teamSkillLevel,
        taskType: task.type,
        title: task.title,
        description: task.description ?? '',
        acceptanceCriteria: task.acceptanceCriteria ?? '',
        apiKey,
      });

      await TaskRepository.update(task.id, { suggestedEstimatedTime }, req);

      results.push({
        taskId: task.id,
        title: task.title,
        type: task.type,
        suggestedEstimatedTime,
      });
    }

    await ApiResponseHandler.success(req, res, {
      processed: results.length,
      results,
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

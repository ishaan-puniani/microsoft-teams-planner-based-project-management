import axios from 'axios';
import ApiResponseHandler from '../apiResponseHandler';
import ProjectRepository from '../../database/repositories/projectRepository';
import TaskRepository from '../../database/repositories/taskRepository';
import { estimateTask } from '../../services/aiAgent/taskService';
import { getConfig } from '../../config';

export { estimateTask } from '../../services/aiAgent/taskService';

export default async function plannerSuggestEstimatesOfTask(req, res, next) {
  const projectId = req.params.projectId;
  const taskId = req.params.taskId;
  const reEstimate = req.query.reEstimate === 'true';

  try {
    const project = await ProjectRepository.findById(projectId, req);
    const projectDescription = project?.description ?? '';
    const teamSkillLevel = project?.teamSkillLevel ?? {};
    const skillsEstimationContext = project?.skillsEstimationContext ?? '';

    const task = await TaskRepository.findById(taskId, req);
    const taskType = task?.type ?? '';
    const title = task?.title ?? '';
    const description = task?.description ?? '';
    const acceptanceCriteria = task?.acceptanceCriteria ?? '';

    if (!reEstimate && task?.suggestedEstimatedTime) {
      return ApiResponseHandler.success(req, res, {
        suggestedEstimatedTime: task.suggestedEstimatedTime,
      });
    }

    const apiKey = getConfig().GEMINI_API_KEY || getConfig().GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY must be set in environment'),
      );
    }

    const suggestedEstimatedTime = await estimateTask({
      skillsEstimationContext,
      projectDescription,
      teamSkillLevel,
      taskType,
      title,
      description,
      acceptanceCriteria,
      apiKey,
    });

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

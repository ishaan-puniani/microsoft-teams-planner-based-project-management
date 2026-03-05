import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';

export default async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const { etag, appliedCategories, assignments, title, priority, startDateTime, dueDateTime } = req.body;

    if (!etag) {
      return ApiResponseHandler.error(req, res, new Error('etag is required'));
    }

    const payload = await MsTaskService.updatePlannerTask(taskId, etag, {
      appliedCategories,
      assignments,
      title,
      priority,
      startDateTime,
      dueDateTime,
    });

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

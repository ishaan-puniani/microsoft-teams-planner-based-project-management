import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';
import { getMsPlannerAuth } from './getMsPlannerAuth';

export default async (req, res, next) => {
  try {
    const msPlannerAuth = getMsPlannerAuth(req);
    const planId = req.params.planId;
    const { bucketId, title, priority, startDateTime, dueDateTime, appliedCategories, assignments } = req.body;

    if (!title || !bucketId) {
      return ApiResponseHandler.error(req, res, new Error('bucketId and title are required'));
    }

    const taskData = {
      planId,
      bucketId,
      title: String(title).trim(),
      ...(priority != null && { priority: Number(priority) }),
      ...(startDateTime != null && { startDateTime: startDateTime || null }),
      ...(dueDateTime != null && { dueDateTime: dueDateTime || null }),
      ...(appliedCategories != null && { appliedCategories }),
      ...(assignments != null && { assignments }),
    };

    const payload = await MsTaskService.createTask(planId, taskData, msPlannerAuth);
    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

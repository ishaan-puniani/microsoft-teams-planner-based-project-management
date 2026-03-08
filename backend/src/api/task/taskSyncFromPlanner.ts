import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import TaskService from '../../services/taskService';
import MsTaskService from '../../integrations/msGraph/msTaskService';

const ALLOWED_FIELDS = ['title', 'description', 'estimatedStart', 'estimatedEnd'];

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(Permissions.values.taskEdit);

    const taskId = req.params.id;
    const { fields: requestedFields } = req.body.data || {};

    const taskService = new TaskService(req);
    const task = await taskService.findById(taskId);
    if (!task) {
      return ApiResponseHandler.error(req, res, new Error('Task not found'));
    }
    if (!task.msPlannerTaskId) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('Task is not linked to a Planner task. Use "Send to Planner" first.'),
      );
    }

    const [plannerTask, plannerDetails] = await Promise.all([
      MsTaskService.getTask(task.msPlannerTaskId),
      MsTaskService.getTaskDetails(task.msPlannerTaskId),
    ]);

    const fieldsToApply = Array.isArray(requestedFields)
      ? requestedFields.filter((f) => ALLOWED_FIELDS.includes(f))
      : ALLOWED_FIELDS;

    const update = {};
    if (fieldsToApply.includes('title') && plannerTask.title != null) {
      update.title = String(plannerTask.title).trim() || undefined;
    }
    if (fieldsToApply.includes('description') && plannerDetails.description != null) {
      update.description = String(plannerDetails.description).trim() || undefined;
    }
    if (fieldsToApply.includes('estimatedStart') && plannerTask.startDateTime) {
      update.estimatedStart = new Date(plannerTask.startDateTime);
    }
    if (fieldsToApply.includes('estimatedEnd') && plannerTask.dueDateTime) {
      update.estimatedEnd = new Date(plannerTask.dueDateTime);
    }

    if (Object.keys(update).length === 0) {
      return ApiResponseHandler.success(req, res, task);
    }

    const updated = await taskService.update(taskId, update);
    await ApiResponseHandler.success(req, res, updated);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

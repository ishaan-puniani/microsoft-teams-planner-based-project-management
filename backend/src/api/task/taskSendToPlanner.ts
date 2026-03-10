import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import TaskService from '../../services/taskService';
import MsTaskService from '../../integrations/msGraph/msTaskService';
import { getMsPlannerAuth } from '../msPlanner/getMsPlannerAuth';

const ALLOWED_FIELDS = ['title', 'description', 'estimatedStart', 'estimatedEnd'];

function toISODate(value) {
  if (value == null) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(Permissions.values.taskEdit);

    const taskId = req.params.id;
    const { planId, bucketId, fields: requestedFields } = req.body.data || {};

    const msPlannerAuth = getMsPlannerAuth(req);
    if (!msPlannerAuth) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('Microsoft Planner credentials not configured for this tenant'),
      );
    }

    const taskService = new TaskService(req);
    const task = await taskService.findById(taskId);
    if (!task) {
      return ApiResponseHandler.error(req, res, new Error('Task not found'));
    }

    const fieldsToSend = Array.isArray(requestedFields)
      ? requestedFields.filter((f) => ALLOWED_FIELDS.includes(f))
      : ALLOWED_FIELDS;

    if (task.msPlannerTaskId) {
      const [plannerTask, plannerDetails] = await Promise.all([
        MsTaskService.getTask(task.msPlannerTaskId, msPlannerAuth),
        MsTaskService.getTaskDetails(task.msPlannerTaskId, msPlannerAuth),
      ]);
      const etag = plannerTask['@odata.etag'] || plannerTask.etag;
      const detailsEtag = plannerDetails._detailsEtag || '';

      const patch: Record<string, any> = {};
      if (fieldsToSend.includes('title') && task.title != null) patch.title = String(task.title).trim();
      if (fieldsToSend.includes('estimatedStart')) patch.startDateTime = toISODate(task.estimatedStart);
      if (fieldsToSend.includes('estimatedEnd')) patch.dueDateTime = toISODate(task.estimatedEnd);

      if (Object.keys(patch).length > 0 && etag) {
        await MsTaskService.updatePlannerTask(task.msPlannerTaskId, etag, patch, msPlannerAuth);
      }

      if (fieldsToSend.includes('description') && task.description != null) {
        await MsTaskService.updateTaskDetailsWithEtag(
          task.msPlannerTaskId,
          detailsEtag,
          { description: String(task.description).trim() },
          msPlannerAuth,
        );
      }

      const updatedPlanner = await MsTaskService.getTask(task.msPlannerTaskId, msPlannerAuth);
      return ApiResponseHandler.success(req, res, { plannerTask: updatedPlanner, updated: true });
    }

    if (!planId || !bucketId) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('planId and bucketId are required to create a new Planner task.'),
      );
    }

    const title = (fieldsToSend.includes('title') && task.title) ? String(task.title).trim() : 'Untitled';
    const createPayload = {
      planId,
      bucketId,
      title,
      startDateTime: fieldsToSend.includes('estimatedStart') ? toISODate(task.estimatedStart) : null,
      dueDateTime: fieldsToSend.includes('estimatedEnd') ? toISODate(task.estimatedEnd) : null,
    };

    const created = await MsTaskService.createTask(planId, createPayload, msPlannerAuth);
    if (fieldsToSend.includes('description') && task.description) {
      await MsTaskService.updateTaskDetails(created.id, String(task.description).trim(), msPlannerAuth);
    }

    await taskService.update(taskId, { msPlannerTaskId: created.id });
    return ApiResponseHandler.success(req, res, { plannerTask: created, updated: false });
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

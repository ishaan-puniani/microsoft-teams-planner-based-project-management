import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import TaskService from '../../services/taskService';
import Error400 from '../../errors/Error400';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.taskEdit,
    );

    const { updates } = req.body.data || req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error400(req.language, 'validation.errors.required');
    }

    const payload = await new TaskService(req).bulkUpdateEstimates(
      updates.map((u: { id: string; title?: string; storyPoints?: string; estimatedTime?: Record<string, number> }) => ({
        id: u.id,
        title: u.title,
        storyPoints: u.storyPoints,
        estimatedTime: u.estimatedTime,
      })),
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

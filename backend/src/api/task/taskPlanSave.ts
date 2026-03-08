import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import TaskService from '../../services/taskService';
import Error400 from '../../errors/Error400';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(Permissions.values.taskEdit);

    const data = req.body.data || req.body;
    const { projectId, newTasks = [], updates = [], deleteTasks = [] } = data;

    if (!projectId) {
      throw new Error400(req.language, 'validation.errors.required');
    }

    const payload = await new TaskService(req).savePlan({
      projectId,
      deleteTasks: Array.isArray(deleteTasks)
        ? deleteTasks.filter((id: unknown) => typeof id === 'string' && id.length > 0)
        : [],
      newTasks: Array.isArray(newTasks)
        ? newTasks.map(
            (t: {
              tempId: string;
              type?: string;
              title?: string;
              storyPoints?: string;
              estimatedTime?: Record<string, number>;
              parentTempId?: string;
              parentId?: string;
            }) => ({
              tempId: t.tempId,
              type: t.type ?? 'TASK',
              title: t.title ?? 'New Task',
              storyPoints: t.storyPoints,
              estimatedTime: t.estimatedTime,
              parentTempId: t.parentTempId,
              parentId: t.parentId,
            }),
          )
        : [],
      updates: Array.isArray(updates)
        ? updates.map(
            (u: {
              id: string;
              title?: string;
              storyPoints?: string;
              estimatedTime?: Record<string, number>;
            }) => ({
              id: u.id,
              title: u.title,
              storyPoints: u.storyPoints,
              estimatedTime: u.estimatedTime,
            }),
          )
        : [],
    });

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

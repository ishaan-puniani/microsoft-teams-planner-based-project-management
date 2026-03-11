import PermissionChecker from '../../../services/user/permissionChecker';
import ApiResponseHandler from '../../apiResponseHandler';
import Permissions from '../../../security/permissions';
import TaskService from '../../../services/taskService';
import Error400 from '../../../errors/Error400';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.taskRead,
    );

    const projectId =
      req.query.projectId ?? req.body?.projectId;
    if (!projectId || typeof projectId !== 'string') {
      throw new Error400(
        req.language,
        'validation.errors.required',
      );
    }

    const type =
      req.query.type ?? req.body?.type;
    const typeFilter =
      type != null && typeof type === 'string' && type.trim() !== ''
        ? type.trim()
        : "EPIC";

    const payload = await new TaskService(req).getAggregateEstimates(
      projectId,
      typeFilter,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

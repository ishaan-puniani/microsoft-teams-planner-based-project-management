/// File is generated from https://studio.fabbuilder.com - taskTemplate

import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import TaskTemplateService from '../../services/taskTemplateService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.taskTemplateRead,
    );

    const payload = await new TaskTemplateService(req).findAllAutocomplete(
      req.query.query,
      req.query.limit,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
/// File is generated from https://studio.fabbuilder.com - taskTemplate

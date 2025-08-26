/// File is generated from https://studio.fabbuilder.com - module

import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ModuleService from '../../services/moduleService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.moduleRead,
    );

    const payload = await new ModuleService(
      req,
    ).findAndCountAll({ ...req.query, countOnly: true });

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
/// File is generated from https://studio.fabbuilder.com - module

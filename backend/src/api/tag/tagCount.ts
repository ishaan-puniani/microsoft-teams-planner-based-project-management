/// File is generated from https://studio.fabbuilder.com - tag

import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import TagService from '../../services/tagService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.tagRead,
    );

    const payload = await new TagService(
      req,
    ).findAndCountAll({ ...req.query, countOnly: true });

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
/// File is generated from https://studio.fabbuilder.com - tag

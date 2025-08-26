/// File is generated from https://studio.fabbuilder.com - testCase

import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import TestCaseService from '../../services/testCaseService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.testCaseRead,
    );

    const payload = await new TestCaseService(
      req,
    ).findAndCountAll({ ...req.query, countOnly: true });

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
/// File is generated from https://studio.fabbuilder.com - testCase

import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ScheduledEventService from '../../services/scheduledEventService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.scheduledEventEdit,
    );

    const requestedScope = String(req.query.scope || 'stale').toLowerCase();
    const scope = ['stale', 'all'].includes(requestedScope)
      ? requestedScope
      : 'stale';
    const limit = Math.abs(Number(req.query.limit) || 200);

    const service = new ScheduledEventService(req);
    const payload =
      scope === 'all'
        ? await service.updateNextOccurance()
        : await service.refreshUpcomingCache(limit);

    await ApiResponseHandler.success(req, res, {
      scope,
      ...payload,
    });
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

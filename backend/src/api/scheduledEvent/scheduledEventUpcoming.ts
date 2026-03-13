import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ScheduledEventService from '../../services/scheduledEventService';

export default async (req, res, next) => {
  try {
    // new PermissionChecker(req).validateHas(
    //   Permissions.values.scheduledEventRead,
    // );

    /**
     * Optional query param: ?hours=N  (defaults to 12)
     * Returns all upcoming occurrences within the next N hours.
     */
    const hours = Math.abs(Number(req.query.hours) || 12);

    const payload = await new ScheduledEventService(req).findUpcoming(hours);

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

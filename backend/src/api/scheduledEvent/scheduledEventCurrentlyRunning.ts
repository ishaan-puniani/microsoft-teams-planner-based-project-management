import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ScheduledEventService from '../../services/scheduledEventService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(
      Permissions.values.scheduledEventRead,
    );

    /**
     * Returns all events that are currently in progress at the time of the request.
     * For one-off events: startDate <= now <= endDate
     * For recurring events: the most recent occurrence started before now and its
     *   computed end time (occurrenceStart + eventDuration) is still in the future.
     */
    const payload = await new ScheduledEventService(req).findCurrentlyRunning();

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

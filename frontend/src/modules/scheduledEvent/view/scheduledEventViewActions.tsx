import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import ScheduledEventService from 'src/modules/scheduledEvent/scheduledEventService';

const prefix = 'SCHEDULEDEVENT_VIEW';

const scheduledEventViewActions = {
  FIND_STARTED: `${prefix}_FIND_STARTED`,
  FIND_SUCCESS: `${prefix}_FIND_SUCCESS`,
  FIND_ERROR: `${prefix}_FIND_ERROR`,

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: scheduledEventViewActions.FIND_STARTED,
      });

      const record = await ScheduledEventService.find(id);

      dispatch({
        type: scheduledEventViewActions.FIND_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: scheduledEventViewActions.FIND_ERROR,
      });

      getHistory().push('/scheduled-event');
    }
  },
};

export default scheduledEventViewActions;

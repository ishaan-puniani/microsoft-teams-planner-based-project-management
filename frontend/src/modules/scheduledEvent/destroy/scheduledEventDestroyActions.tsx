import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import listActions from 'src/modules/scheduledEvent/list/scheduledEventListActions';
import ScheduledEventService from 'src/modules/scheduledEvent/scheduledEventService';
import Message from 'src/view/shared/message';

const prefix = 'SCHEDULEDEVENT_DESTROY';

const scheduledEventDestroyActions = {
  DESTROY_STARTED: `${prefix}_DESTROY_STARTED`,
  DESTROY_SUCCESS: `${prefix}_DESTROY_SUCCESS`,
  DESTROY_ERROR: `${prefix}_DESTROY_ERROR`,

  DESTROY_ALL_STARTED: `${prefix}_DESTROY_ALL_STARTED`,
  DESTROY_ALL_SUCCESS: `${prefix}_DESTROY_ALL_SUCCESS`,
  DESTROY_ALL_ERROR: `${prefix}_DESTROY_ALL_ERROR`,

  doDestroy: (id) => async (dispatch) => {
    try {
      dispatch({
        type: scheduledEventDestroyActions.DESTROY_STARTED,
      });

      await ScheduledEventService.destroyAll([id]);

      dispatch({
        type: scheduledEventDestroyActions.DESTROY_SUCCESS,
      });

      Message.success(
        i18n('entities.scheduledEvent.destroy.success'),
      );

      dispatch(listActions.doFetchCurrentFilter());

      getHistory().push('/scheduled-event');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: scheduledEventDestroyActions.DESTROY_ERROR,
      });
    }
  },

  doDestroyAll: (ids) => async (dispatch) => {
    try {
      dispatch({
        type: scheduledEventDestroyActions.DESTROY_ALL_STARTED,
      });

      await ScheduledEventService.destroyAll(ids);

      dispatch({
        type: scheduledEventDestroyActions.DESTROY_ALL_SUCCESS,
      });

      if (listActions) {
        dispatch(listActions.doClearAllSelected());
        dispatch(listActions.doFetchCurrentFilter());
      }

      Message.success(
        i18n('entities.scheduledEvent.destroyAll.success'),
      );

      getHistory().push('/scheduled-event');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: scheduledEventDestroyActions.DESTROY_ALL_ERROR,
      });
    }
  },
};

export default scheduledEventDestroyActions;

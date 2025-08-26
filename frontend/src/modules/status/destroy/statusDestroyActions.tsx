import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import listActions from 'src/modules/status/list/statusListActions';
import StatusService from 'src/modules/status/statusService';
import { getHistory } from 'src/modules/store';
import Message from 'src/view/shared/message';

const prefix = 'STATUS_DESTROY';

const statusDestroyActions = {
  DESTROY_STARTED: `${prefix}_DESTROY_STARTED`,
  DESTROY_SUCCESS: `${prefix}_DESTROY_SUCCESS`,
  DESTROY_ERROR: `${prefix}_DESTROY_ERROR`,

  DESTROY_ALL_STARTED: `${prefix}_DESTROY_ALL_STARTED`,
  DESTROY_ALL_SUCCESS: `${prefix}_DESTROY_ALL_SUCCESS`,
  DESTROY_ALL_ERROR: `${prefix}_DESTROY_ALL_ERROR`,

  doDestroy: (id) => async (dispatch) => {
    try {
      dispatch({
        type: statusDestroyActions.DESTROY_STARTED,
      });

      await StatusService.destroyAll([id]);

      dispatch({
        type: statusDestroyActions.DESTROY_SUCCESS,
      });

      Message.success(
        i18n('entities.status.destroy.success'),
      );

      dispatch(listActions.doFetchCurrentFilter());

      getHistory().push('/status');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: statusDestroyActions.DESTROY_ERROR,
      });
    }
  },

  doDestroyAll: (ids) => async (dispatch) => {
    try {
      dispatch({
        type: statusDestroyActions.DESTROY_ALL_STARTED,
      });

      await StatusService.destroyAll(ids);

      dispatch({
        type: statusDestroyActions.DESTROY_ALL_SUCCESS,
      });

      if (listActions) {
        dispatch(listActions.doClearAllSelected());
        dispatch(listActions.doFetchCurrentFilter());
      }

      Message.success(
        i18n('entities.status.destroyAll.success'),
      );

      getHistory().push('/status');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: statusDestroyActions.DESTROY_ALL_ERROR,
      });
    }
  },
};

export default statusDestroyActions;

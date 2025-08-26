import Errors from 'src/modules/shared/error/errors';
import StatusService from 'src/modules/status/statusService';
import { getHistory } from 'src/modules/store';

const prefix = 'STATUS_VIEW';

const statusViewActions = {
  FIND_STARTED: `${prefix}_FIND_STARTED`,
  FIND_SUCCESS: `${prefix}_FIND_SUCCESS`,
  FIND_ERROR: `${prefix}_FIND_ERROR`,

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: statusViewActions.FIND_STARTED,
      });

      const record = await StatusService.find(id);

      dispatch({
        type: statusViewActions.FIND_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: statusViewActions.FIND_ERROR,
      });

      getHistory().push('/status');
    }
  },
};

export default statusViewActions;

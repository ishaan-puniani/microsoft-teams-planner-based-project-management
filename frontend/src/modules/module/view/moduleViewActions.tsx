import ModuleService from 'src/modules/module/moduleService';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';

const prefix = 'MODULE_VIEW';

const moduleViewActions = {
  FIND_STARTED: `${prefix}_FIND_STARTED`,
  FIND_SUCCESS: `${prefix}_FIND_SUCCESS`,
  FIND_ERROR: `${prefix}_FIND_ERROR`,

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: moduleViewActions.FIND_STARTED,
      });

      const record = await ModuleService.find(id);

      dispatch({
        type: moduleViewActions.FIND_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: moduleViewActions.FIND_ERROR,
      });

      getHistory().push('/module');
    }
  },
};

export default moduleViewActions;

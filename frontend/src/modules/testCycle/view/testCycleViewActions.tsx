import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import TestCycleService from 'src/modules/testCycle/testCycleService';

const prefix = 'TESTCYCLE_VIEW';

const testCycleViewActions = {
  FIND_STARTED: `${prefix}_FIND_STARTED`,
  FIND_SUCCESS: `${prefix}_FIND_SUCCESS`,
  FIND_ERROR: `${prefix}_FIND_ERROR`,

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: testCycleViewActions.FIND_STARTED,
      });

      const record = await TestCycleService.find(id);

      dispatch({
        type: testCycleViewActions.FIND_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testCycleViewActions.FIND_ERROR,
      });

      getHistory().push('/test-cycle');
    }
  },
};

export default testCycleViewActions;

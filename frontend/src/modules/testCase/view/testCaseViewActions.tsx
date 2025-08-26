import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import TestCaseService from 'src/modules/testCase/testCaseService';

const prefix = 'TESTCASE_VIEW';

const testCaseViewActions = {
  FIND_STARTED: `${prefix}_FIND_STARTED`,
  FIND_SUCCESS: `${prefix}_FIND_SUCCESS`,
  FIND_ERROR: `${prefix}_FIND_ERROR`,

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: testCaseViewActions.FIND_STARTED,
      });

      const record = await TestCaseService.find(id);

      dispatch({
        type: testCaseViewActions.FIND_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testCaseViewActions.FIND_ERROR,
      });

      getHistory().push('/test-case');
    }
  },
};

export default testCaseViewActions;

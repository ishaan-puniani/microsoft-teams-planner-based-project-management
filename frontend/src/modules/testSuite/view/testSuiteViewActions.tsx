import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import TestSuiteService from 'src/modules/testSuite/testSuiteService';

const prefix = 'TESTSUITE_VIEW';

const testSuiteViewActions = {
  FIND_STARTED: `${prefix}_FIND_STARTED`,
  FIND_SUCCESS: `${prefix}_FIND_SUCCESS`,
  FIND_ERROR: `${prefix}_FIND_ERROR`,

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: testSuiteViewActions.FIND_STARTED,
      });

      const record = await TestSuiteService.find(id);

      dispatch({
        type: testSuiteViewActions.FIND_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testSuiteViewActions.FIND_ERROR,
      });

      getHistory().push('/test-suite');
    }
  },
};

export default testSuiteViewActions;

import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import TestPlanService from 'src/modules/testPlan/testPlanService';

const prefix = 'TESTPLAN_VIEW';

const testPlanViewActions = {
  FIND_STARTED: `${prefix}_FIND_STARTED`,
  FIND_SUCCESS: `${prefix}_FIND_SUCCESS`,
  FIND_ERROR: `${prefix}_FIND_ERROR`,

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: testPlanViewActions.FIND_STARTED,
      });

      const record = await TestPlanService.find(id);

      dispatch({
        type: testPlanViewActions.FIND_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testPlanViewActions.FIND_ERROR,
      });

      getHistory().push('/test-plan');
    }
  },
};

export default testPlanViewActions;

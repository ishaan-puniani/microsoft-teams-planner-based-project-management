import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import listActions from 'src/modules/testPlan/list/testPlanListActions';
import TestPlanService from 'src/modules/testPlan/testPlanService';
import Message from 'src/view/shared/message';

const prefix = 'TESTPLAN_DESTROY';

const testPlanDestroyActions = {
  DESTROY_STARTED: `${prefix}_DESTROY_STARTED`,
  DESTROY_SUCCESS: `${prefix}_DESTROY_SUCCESS`,
  DESTROY_ERROR: `${prefix}_DESTROY_ERROR`,

  DESTROY_ALL_STARTED: `${prefix}_DESTROY_ALL_STARTED`,
  DESTROY_ALL_SUCCESS: `${prefix}_DESTROY_ALL_SUCCESS`,
  DESTROY_ALL_ERROR: `${prefix}_DESTROY_ALL_ERROR`,

  doDestroy: (id) => async (dispatch) => {
    try {
      dispatch({
        type: testPlanDestroyActions.DESTROY_STARTED,
      });

      await TestPlanService.destroyAll([id]);

      dispatch({
        type: testPlanDestroyActions.DESTROY_SUCCESS,
      });

      Message.success(
        i18n('entities.testPlan.destroy.success'),
      );

      dispatch(listActions.doFetchCurrentFilter());

      getHistory().push('/test-plan');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: testPlanDestroyActions.DESTROY_ERROR,
      });
    }
  },

  doDestroyAll: (ids) => async (dispatch) => {
    try {
      dispatch({
        type: testPlanDestroyActions.DESTROY_ALL_STARTED,
      });

      await TestPlanService.destroyAll(ids);

      dispatch({
        type: testPlanDestroyActions.DESTROY_ALL_SUCCESS,
      });

      if (listActions) {
        dispatch(listActions.doClearAllSelected());
        dispatch(listActions.doFetchCurrentFilter());
      }

      Message.success(
        i18n('entities.testPlan.destroyAll.success'),
      );

      getHistory().push('/test-plan');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: testPlanDestroyActions.DESTROY_ALL_ERROR,
      });
    }
  },
};

export default testPlanDestroyActions;

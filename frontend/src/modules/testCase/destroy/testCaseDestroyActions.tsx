import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import listActions from 'src/modules/testCase/list/testCaseListActions';
import TestCaseService from 'src/modules/testCase/testCaseService';
import Message from 'src/view/shared/message';

const prefix = 'TESTCASE_DESTROY';

const testCaseDestroyActions = {
  DESTROY_STARTED: `${prefix}_DESTROY_STARTED`,
  DESTROY_SUCCESS: `${prefix}_DESTROY_SUCCESS`,
  DESTROY_ERROR: `${prefix}_DESTROY_ERROR`,

  DESTROY_ALL_STARTED: `${prefix}_DESTROY_ALL_STARTED`,
  DESTROY_ALL_SUCCESS: `${prefix}_DESTROY_ALL_SUCCESS`,
  DESTROY_ALL_ERROR: `${prefix}_DESTROY_ALL_ERROR`,

  doDestroy: (id) => async (dispatch) => {
    try {
      dispatch({
        type: testCaseDestroyActions.DESTROY_STARTED,
      });

      await TestCaseService.destroyAll([id]);

      dispatch({
        type: testCaseDestroyActions.DESTROY_SUCCESS,
      });

      Message.success(
        i18n('entities.testCase.destroy.success'),
      );

      dispatch(listActions.doFetchCurrentFilter());

      getHistory().push('/test-case');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: testCaseDestroyActions.DESTROY_ERROR,
      });
    }
  },

  doDestroyAll: (ids) => async (dispatch) => {
    try {
      dispatch({
        type: testCaseDestroyActions.DESTROY_ALL_STARTED,
      });

      await TestCaseService.destroyAll(ids);

      dispatch({
        type: testCaseDestroyActions.DESTROY_ALL_SUCCESS,
      });

      if (listActions) {
        dispatch(listActions.doClearAllSelected());
        dispatch(listActions.doFetchCurrentFilter());
      }

      Message.success(
        i18n('entities.testCase.destroyAll.success'),
      );

      getHistory().push('/test-case');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: testCaseDestroyActions.DESTROY_ALL_ERROR,
      });
    }
  },
};

export default testCaseDestroyActions;

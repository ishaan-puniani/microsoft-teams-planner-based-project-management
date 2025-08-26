import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import listActions from 'src/modules/testSuite/list/testSuiteListActions';
import TestSuiteService from 'src/modules/testSuite/testSuiteService';
import Message from 'src/view/shared/message';

const prefix = 'TESTSUITE_DESTROY';

const testSuiteDestroyActions = {
  DESTROY_STARTED: `${prefix}_DESTROY_STARTED`,
  DESTROY_SUCCESS: `${prefix}_DESTROY_SUCCESS`,
  DESTROY_ERROR: `${prefix}_DESTROY_ERROR`,

  DESTROY_ALL_STARTED: `${prefix}_DESTROY_ALL_STARTED`,
  DESTROY_ALL_SUCCESS: `${prefix}_DESTROY_ALL_SUCCESS`,
  DESTROY_ALL_ERROR: `${prefix}_DESTROY_ALL_ERROR`,

  doDestroy: (id) => async (dispatch) => {
    try {
      dispatch({
        type: testSuiteDestroyActions.DESTROY_STARTED,
      });

      await TestSuiteService.destroyAll([id]);

      dispatch({
        type: testSuiteDestroyActions.DESTROY_SUCCESS,
      });

      Message.success(
        i18n('entities.testSuite.destroy.success'),
      );

      dispatch(listActions.doFetchCurrentFilter());

      getHistory().push('/test-suite');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: testSuiteDestroyActions.DESTROY_ERROR,
      });
    }
  },

  doDestroyAll: (ids) => async (dispatch) => {
    try {
      dispatch({
        type: testSuiteDestroyActions.DESTROY_ALL_STARTED,
      });

      await TestSuiteService.destroyAll(ids);

      dispatch({
        type: testSuiteDestroyActions.DESTROY_ALL_SUCCESS,
      });

      if (listActions) {
        dispatch(listActions.doClearAllSelected());
        dispatch(listActions.doFetchCurrentFilter());
      }

      Message.success(
        i18n('entities.testSuite.destroyAll.success'),
      );

      getHistory().push('/test-suite');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: testSuiteDestroyActions.DESTROY_ALL_ERROR,
      });
    }
  },
};

export default testSuiteDestroyActions;

import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import TestSuiteService from 'src/modules/testSuite/testSuiteService';
import Message from 'src/view/shared/message';

const prefix = 'TESTSUITE_FORM';

const testSuiteFormActions = {
  INIT_STARTED: `${prefix}_INIT_STARTED`,
  INIT_SUCCESS: `${prefix}_INIT_SUCCESS`,
  INIT_ERROR: `${prefix}_INIT_ERROR`,

  CREATE_STARTED: `${prefix}_CREATE_STARTED`,
  CREATE_SUCCESS: `${prefix}_CREATE_SUCCESS`,
  CREATE_ERROR: `${prefix}_CREATE_ERROR`,

  UPDATE_STARTED: `${prefix}_UPDATE_STARTED`,
  UPDATE_SUCCESS: `${prefix}_UPDATE_SUCCESS`,
  UPDATE_ERROR: `${prefix}_UPDATE_ERROR`,

  doInit: (id) => async (dispatch) => {
    try {
      dispatch({
        type: testSuiteFormActions.INIT_STARTED,
      });

      let record = {};

      const isEdit = Boolean(id);

      if (isEdit) {
        record = await TestSuiteService.find(id);
      }

      dispatch({
        type: testSuiteFormActions.INIT_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testSuiteFormActions.INIT_ERROR,
      });

      getHistory().push('/test-suite');
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: testSuiteFormActions.CREATE_STARTED,
      });

      await TestSuiteService.create(values);

      dispatch({
        type: testSuiteFormActions.CREATE_SUCCESS,
      });

      Message.success(
        i18n('entities.testSuite.create.success'),
      );

      getHistory().push('/test-suite');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testSuiteFormActions.CREATE_ERROR,
      });
    }
  },

  doUpdate: (id, values) => async (dispatch, getState) => {
    try {
      dispatch({
        type: testSuiteFormActions.UPDATE_STARTED,
      });

      await TestSuiteService.update(id, values);

      dispatch({
        type: testSuiteFormActions.UPDATE_SUCCESS,
      });

      Message.success(
        i18n('entities.testSuite.update.success'),
      );

      getHistory().push('/test-suite');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testSuiteFormActions.UPDATE_ERROR,
      });
    }
  },
};

export default testSuiteFormActions;

import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import TestCaseService from 'src/modules/testCase/testCaseService';
import Message from 'src/view/shared/message';

const prefix = 'TESTCASE_FORM';

const testCaseFormActions = {
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
        type: testCaseFormActions.INIT_STARTED,
      });

      let record = {};

      const isEdit = Boolean(id);

      if (isEdit) {
        record = await TestCaseService.find(id);
      }

      dispatch({
        type: testCaseFormActions.INIT_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testCaseFormActions.INIT_ERROR,
      });

      getHistory().push('/test-case');
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: testCaseFormActions.CREATE_STARTED,
      });

      await TestCaseService.create(values);

      dispatch({
        type: testCaseFormActions.CREATE_SUCCESS,
      });

      Message.success(
        i18n('entities.testCase.create.success'),
      );

      getHistory().push('/test-case');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testCaseFormActions.CREATE_ERROR,
      });
    }
  },

  doUpdate: (id, values) => async (dispatch, getState) => {
    try {
      dispatch({
        type: testCaseFormActions.UPDATE_STARTED,
      });

      await TestCaseService.update(id, values);

      dispatch({
        type: testCaseFormActions.UPDATE_SUCCESS,
      });

      Message.success(
        i18n('entities.testCase.update.success'),
      );

      getHistory().push('/test-case');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testCaseFormActions.UPDATE_ERROR,
      });
    }
  },
};

export default testCaseFormActions;

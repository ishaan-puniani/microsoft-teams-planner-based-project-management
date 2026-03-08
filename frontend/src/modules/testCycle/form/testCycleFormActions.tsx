import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import TestCycleService from 'src/modules/testCycle/testCycleService';
import Message from 'src/view/shared/message';

const prefix = 'TESTCYCLE_FORM';

const testCycleFormActions = {
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
        type: testCycleFormActions.INIT_STARTED,
      });

      let record = {};

      const isEdit = Boolean(id);

      if (isEdit) {
        record = await TestCycleService.find(id);
      }

      dispatch({
        type: testCycleFormActions.INIT_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testCycleFormActions.INIT_ERROR,
      });

      getHistory().push('/test-cycle');
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: testCycleFormActions.CREATE_STARTED,
      });

      await TestCycleService.create(values);

      dispatch({
        type: testCycleFormActions.CREATE_SUCCESS,
      });

      Message.success(
        i18n('entities.testCycle.create.success'),
      );

      getHistory().push('/test-cycle');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testCycleFormActions.CREATE_ERROR,
      });
    }
  },

  doUpdate: (id, values) => async (dispatch, getState) => {
    try {
      dispatch({
        type: testCycleFormActions.UPDATE_STARTED,
      });

      await TestCycleService.update(id, values);

      dispatch({
        type: testCycleFormActions.UPDATE_SUCCESS,
      });

      Message.success(
        i18n('entities.testCycle.update.success'),
      );

      getHistory().push('/test-cycle');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: testCycleFormActions.UPDATE_ERROR,
      });
    }
  },
};

export default testCycleFormActions;

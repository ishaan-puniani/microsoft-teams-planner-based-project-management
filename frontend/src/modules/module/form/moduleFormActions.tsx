import { i18n } from 'src/i18n';
import ModuleService from 'src/modules/module/moduleService';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import Message from 'src/view/shared/message';

const prefix = 'MODULE_FORM';

const moduleFormActions = {
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
        type: moduleFormActions.INIT_STARTED,
      });

      let record = {};

      const isEdit = Boolean(id);

      if (isEdit) {
        record = await ModuleService.find(id);
      }

      dispatch({
        type: moduleFormActions.INIT_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: moduleFormActions.INIT_ERROR,
      });

      getHistory().push('/module');
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: moduleFormActions.CREATE_STARTED,
      });

      await ModuleService.create(values);

      dispatch({
        type: moduleFormActions.CREATE_SUCCESS,
      });

      Message.success(
        i18n('entities.module.create.success'),
      );

      getHistory().push('/module');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: moduleFormActions.CREATE_ERROR,
      });
    }
  },

  doUpdate: (id, values) => async (dispatch, getState) => {
    try {
      dispatch({
        type: moduleFormActions.UPDATE_STARTED,
      });

      await ModuleService.update(id, values);

      dispatch({
        type: moduleFormActions.UPDATE_SUCCESS,
      });

      Message.success(
        i18n('entities.module.update.success'),
      );

      getHistory().push('/module');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: moduleFormActions.UPDATE_ERROR,
      });
    }
  },
};

export default moduleFormActions;

import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import StatusService from 'src/modules/status/statusService';
import { getHistory } from 'src/modules/store';
import Message from 'src/view/shared/message';

const prefix = 'STATUS_FORM';

const statusFormActions = {
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
        type: statusFormActions.INIT_STARTED,
      });

      let record = {};

      const isEdit = Boolean(id);

      if (isEdit) {
        record = await StatusService.find(id);
      }

      dispatch({
        type: statusFormActions.INIT_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: statusFormActions.INIT_ERROR,
      });

      getHistory().push('/status');
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: statusFormActions.CREATE_STARTED,
      });

      await StatusService.create(values);

      dispatch({
        type: statusFormActions.CREATE_SUCCESS,
      });

      Message.success(
        i18n('entities.status.create.success'),
      );

      getHistory().push('/status');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: statusFormActions.CREATE_ERROR,
      });
    }
  },

  doUpdate: (id, values) => async (dispatch, getState) => {
    try {
      dispatch({
        type: statusFormActions.UPDATE_STARTED,
      });

      await StatusService.update(id, values);

      dispatch({
        type: statusFormActions.UPDATE_SUCCESS,
      });

      Message.success(
        i18n('entities.status.update.success'),
      );

      getHistory().push('/status');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: statusFormActions.UPDATE_ERROR,
      });
    }
  },
};

export default statusFormActions;

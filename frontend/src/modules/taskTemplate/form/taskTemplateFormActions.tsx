import { i18n } from 'src/i18n';
import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import Message from 'src/view/shared/message';

const prefix = 'TASK_TEMPLATE_FORM';

const taskTemplateFormActions = {
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
        type: taskTemplateFormActions.INIT_STARTED,
      });

      let record = {};

      const isEdit = Boolean(id);

      if (isEdit) {
        record = await TaskTemplateService.find(id);
      }

      dispatch({
        type: taskTemplateFormActions.INIT_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: taskTemplateFormActions.INIT_ERROR,
      });

      getHistory().push('/task-template');
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: taskTemplateFormActions.CREATE_STARTED,
      });

      await TaskTemplateService.create(values);

      dispatch({
        type: taskTemplateFormActions.CREATE_SUCCESS,
      });

      Message.success(
        i18n('entities.taskTemplate.create.success'),
      );

      getHistory().push('/task-template');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: taskTemplateFormActions.CREATE_ERROR,
      });
    }
  },

  doUpdate: (id, values) => async (dispatch, getState) => {
    try {
      dispatch({
        type: taskTemplateFormActions.UPDATE_STARTED,
      });

      await TaskTemplateService.update(id, values);

      dispatch({
        type: taskTemplateFormActions.UPDATE_SUCCESS,
      });

      Message.success(
        i18n('entities.taskTemplate.update.success'),
      );

      getHistory().push('/task-template');
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: taskTemplateFormActions.UPDATE_ERROR,
      });
    }
  },
};

export default taskTemplateFormActions;

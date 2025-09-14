import { i18n } from 'src/i18n';
import listActions from 'src/modules/taskTemplate/list/taskTemplateListActions';
import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import Message from 'src/view/shared/message';

const prefix = 'TASK_TEMPLATE_DESTROY';

const taskTemplateDestroyActions = {
  DESTROY_STARTED: `${prefix}_DESTROY_STARTED`,
  DESTROY_SUCCESS: `${prefix}_DESTROY_SUCCESS`,
  DESTROY_ERROR: `${prefix}_DESTROY_ERROR`,

  DESTROY_ALL_STARTED: `${prefix}_DESTROY_ALL_STARTED`,
  DESTROY_ALL_SUCCESS: `${prefix}_DESTROY_ALL_SUCCESS`,
  DESTROY_ALL_ERROR: `${prefix}_DESTROY_ALL_ERROR`,

  doDestroy: (id) => async (dispatch) => {
    try {
      dispatch({
        type: taskTemplateDestroyActions.DESTROY_STARTED,
      });

      await TaskTemplateService.destroyAll([id]);

      dispatch({
        type: taskTemplateDestroyActions.DESTROY_SUCCESS,
      });

      Message.success(
        i18n('entities.taskTemplate.destroy.success'),
      );

      dispatch(listActions.doFetchCurrentFilter());

      getHistory().push('/task-template');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: taskTemplateDestroyActions.DESTROY_ERROR,
      });
    }
  },

  doDestroyAll: (ids) => async (dispatch) => {
    try {
      dispatch({
        type: taskTemplateDestroyActions.DESTROY_ALL_STARTED,
      });

      await TaskTemplateService.destroyAll(ids);

      dispatch({
        type: taskTemplateDestroyActions.DESTROY_ALL_SUCCESS,
      });

      if (listActions) {
        dispatch(listActions.doClearAllSelected());
        dispatch(listActions.doFetchCurrentFilter());
      }

      Message.success(
        i18n('entities.taskTemplate.destroyAll.success'),
      );

      getHistory().push('/task-template');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: taskTemplateDestroyActions.DESTROY_ALL_ERROR,
      });
    }
  },
};

export default taskTemplateDestroyActions;

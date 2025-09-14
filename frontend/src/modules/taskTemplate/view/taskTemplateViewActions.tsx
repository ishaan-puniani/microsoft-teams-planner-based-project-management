import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';

const prefix = 'TASK_TEMPLATE_VIEW';

const taskTemplateViewActions = {
  FIND_STARTED: `${prefix}_FIND_STARTED`,
  FIND_SUCCESS: `${prefix}_FIND_SUCCESS`,
  FIND_ERROR: `${prefix}_FIND_ERROR`,

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: taskTemplateViewActions.FIND_STARTED,
      });

      const record = await TaskTemplateService.find(id);

      dispatch({
        type: taskTemplateViewActions.FIND_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: taskTemplateViewActions.FIND_ERROR,
      });

      getHistory().push('/task-template');
    }
  },
};

export default taskTemplateViewActions;

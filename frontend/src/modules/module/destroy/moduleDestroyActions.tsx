import { i18n } from 'src/i18n';
import listActions from 'src/modules/module/list/moduleListActions';
import ModuleService from 'src/modules/module/moduleService';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import Message from 'src/view/shared/message';

const prefix = 'MODULE_DESTROY';

const moduleDestroyActions = {
  DESTROY_STARTED: `${prefix}_DESTROY_STARTED`,
  DESTROY_SUCCESS: `${prefix}_DESTROY_SUCCESS`,
  DESTROY_ERROR: `${prefix}_DESTROY_ERROR`,

  DESTROY_ALL_STARTED: `${prefix}_DESTROY_ALL_STARTED`,
  DESTROY_ALL_SUCCESS: `${prefix}_DESTROY_ALL_SUCCESS`,
  DESTROY_ALL_ERROR: `${prefix}_DESTROY_ALL_ERROR`,

  doDestroy: (id) => async (dispatch) => {
    try {
      dispatch({
        type: moduleDestroyActions.DESTROY_STARTED,
      });

      await ModuleService.destroyAll([id]);

      dispatch({
        type: moduleDestroyActions.DESTROY_SUCCESS,
      });

      Message.success(
        i18n('entities.module.destroy.success'),
      );

      dispatch(listActions.doFetchCurrentFilter());

      getHistory().push('/module');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: moduleDestroyActions.DESTROY_ERROR,
      });
    }
  },

  doDestroyAll: (ids) => async (dispatch) => {
    try {
      dispatch({
        type: moduleDestroyActions.DESTROY_ALL_STARTED,
      });

      await ModuleService.destroyAll(ids);

      dispatch({
        type: moduleDestroyActions.DESTROY_ALL_SUCCESS,
      });

      if (listActions) {
        dispatch(listActions.doClearAllSelected());
        dispatch(listActions.doFetchCurrentFilter());
      }

      Message.success(
        i18n('entities.module.destroyAll.success'),
      );

      getHistory().push('/module');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: moduleDestroyActions.DESTROY_ALL_ERROR,
      });
    }
  },
};

export default moduleDestroyActions;

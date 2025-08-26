import { i18n } from 'src/i18n';
import listActions from 'src/modules/requirement/list/requirementListActions';
import RequirementService from 'src/modules/requirement/requirementService';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';
import Message from 'src/view/shared/message';

const prefix = 'REQUIREMENT_DESTROY';

const requirementDestroyActions = {
  DESTROY_STARTED: `${prefix}_DESTROY_STARTED`,
  DESTROY_SUCCESS: `${prefix}_DESTROY_SUCCESS`,
  DESTROY_ERROR: `${prefix}_DESTROY_ERROR`,

  DESTROY_ALL_STARTED: `${prefix}_DESTROY_ALL_STARTED`,
  DESTROY_ALL_SUCCESS: `${prefix}_DESTROY_ALL_SUCCESS`,
  DESTROY_ALL_ERROR: `${prefix}_DESTROY_ALL_ERROR`,

  doDestroy: (id) => async (dispatch) => {
    try {
      dispatch({
        type: requirementDestroyActions.DESTROY_STARTED,
      });

      await RequirementService.destroyAll([id]);

      dispatch({
        type: requirementDestroyActions.DESTROY_SUCCESS,
      });

      Message.success(
        i18n('entities.requirement.destroy.success'),
      );

      dispatch(listActions.doFetchCurrentFilter());

      getHistory().push('/requirement');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: requirementDestroyActions.DESTROY_ERROR,
      });
    }
  },

  doDestroyAll: (ids) => async (dispatch) => {
    try {
      dispatch({
        type: requirementDestroyActions.DESTROY_ALL_STARTED,
      });

      await RequirementService.destroyAll(ids);

      dispatch({
        type: requirementDestroyActions.DESTROY_ALL_SUCCESS,
      });

      if (listActions) {
        dispatch(listActions.doClearAllSelected());
        dispatch(listActions.doFetchCurrentFilter());
      }

      Message.success(
        i18n('entities.requirement.destroyAll.success'),
      );

      getHistory().push('/requirement');
    } catch (error) {
      Errors.handle(error);

      dispatch(listActions.doFetchCurrentFilter());

      dispatch({
        type: requirementDestroyActions.DESTROY_ALL_ERROR,
      });
    }
  },
};

export default requirementDestroyActions;

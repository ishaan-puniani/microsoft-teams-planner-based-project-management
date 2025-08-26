import RequirementService from 'src/modules/requirement/requirementService';
import Errors from 'src/modules/shared/error/errors';
import { getHistory } from 'src/modules/store';

const prefix = 'REQUIREMENT_VIEW';

const requirementViewActions = {
  FIND_STARTED: `${prefix}_FIND_STARTED`,
  FIND_SUCCESS: `${prefix}_FIND_SUCCESS`,
  FIND_ERROR: `${prefix}_FIND_ERROR`,

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: requirementViewActions.FIND_STARTED,
      });

      const record = await RequirementService.find(id);

      dispatch({
        type: requirementViewActions.FIND_SUCCESS,
        payload: record,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: requirementViewActions.FIND_ERROR,
      });

      getHistory().push('/requirement');
    }
  },
};

export default requirementViewActions;

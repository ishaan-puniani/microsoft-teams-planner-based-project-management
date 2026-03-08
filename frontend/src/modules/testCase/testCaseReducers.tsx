import { combineReducers } from 'redux';
import destroy from 'src/modules/testCase/destroy/testCaseDestroyReducers';
import list from 'src/modules/testCase/list/testCaseListReducers';

export default combineReducers({
  list,
  destroy,
});

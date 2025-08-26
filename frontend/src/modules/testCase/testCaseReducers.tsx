import { combineReducers } from 'redux';
import destroy from 'src/modules/testCase/destroy/testCaseDestroyReducers';
import form from 'src/modules/testCase/form/testCaseFormReducers';
import importerReducer from 'src/modules/testCase/importer/testCaseImporterReducers';
import list from 'src/modules/testCase/list/testCaseListReducers';
import view from 'src/modules/testCase/view/testCaseViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

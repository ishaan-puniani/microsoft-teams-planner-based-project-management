import { combineReducers } from 'redux';
import destroy from 'src/modules/testSuite/destroy/testSuiteDestroyReducers';
import form from 'src/modules/testSuite/form/testSuiteFormReducers';
import importerReducer from 'src/modules/testSuite/importer/testSuiteImporterReducers';
import list from 'src/modules/testSuite/list/testSuiteListReducers';
import view from 'src/modules/testSuite/view/testSuiteViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

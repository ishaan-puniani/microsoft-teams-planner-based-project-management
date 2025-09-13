import { combineReducers } from 'redux';
import destroy from 'src/modules/project/destroy/projectDestroyReducers';
import form from 'src/modules/project/form/projectFormReducers';
import importerReducer from 'src/modules/project/importer/projectImporterReducers';
import list from 'src/modules/project/list/projectListReducers';
import view from 'src/modules/project/view/projectViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

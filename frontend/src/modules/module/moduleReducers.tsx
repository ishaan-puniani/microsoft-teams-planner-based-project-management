import { combineReducers } from 'redux';
import destroy from 'src/modules/module/destroy/moduleDestroyReducers';
import form from 'src/modules/module/form/moduleFormReducers';
import importerReducer from 'src/modules/module/importer/moduleImporterReducers';
import list from 'src/modules/module/list/moduleListReducers';
import view from 'src/modules/module/view/moduleViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

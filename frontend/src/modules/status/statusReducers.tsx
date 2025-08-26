import { combineReducers } from 'redux';
import destroy from 'src/modules/status/destroy/statusDestroyReducers';
import form from 'src/modules/status/form/statusFormReducers';
import importerReducer from 'src/modules/status/importer/statusImporterReducers';
import list from 'src/modules/status/list/statusListReducers';
import view from 'src/modules/status/view/statusViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

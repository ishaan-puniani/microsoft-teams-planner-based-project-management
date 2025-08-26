import { combineReducers } from 'redux';
import destroy from 'src/modules/tag/destroy/tagDestroyReducers';
import form from 'src/modules/tag/form/tagFormReducers';
import importerReducer from 'src/modules/tag/importer/tagImporterReducers';
import list from 'src/modules/tag/list/tagListReducers';
import view from 'src/modules/tag/view/tagViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

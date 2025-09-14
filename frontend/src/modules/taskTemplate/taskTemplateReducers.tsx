import { combineReducers } from 'redux';
import destroy from 'src/modules/taskTemplate/destroy/taskTemplateDestroyReducers';
import form from 'src/modules/taskTemplate/form/taskTemplateFormReducers';
import importerReducer from 'src/modules/taskTemplate/importer/taskTemplateImporterReducers';
import list from 'src/modules/taskTemplate/list/taskTemplateListReducers';
import view from 'src/modules/taskTemplate/view/taskTemplateViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

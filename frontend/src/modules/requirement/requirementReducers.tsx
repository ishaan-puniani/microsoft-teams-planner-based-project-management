import { combineReducers } from 'redux';
import destroy from 'src/modules/requirement/destroy/requirementDestroyReducers';
import form from 'src/modules/requirement/form/requirementFormReducers';
import importerReducer from 'src/modules/requirement/importer/requirementImporterReducers';
import list from 'src/modules/requirement/list/requirementListReducers';
import view from 'src/modules/requirement/view/requirementViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

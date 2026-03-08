import { combineReducers } from 'redux';
import destroy from 'src/modules/testCycle/destroy/testCycleDestroyReducers';
import form from 'src/modules/testCycle/form/testCycleFormReducers';
import importerReducer from './importer/testCycleImporterReducers';
import list from 'src/modules/testCycle/list/testCycleListReducers';
import view from 'src/modules/testCycle/view/testCycleViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

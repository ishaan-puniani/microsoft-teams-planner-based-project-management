import { combineReducers } from 'redux';
import destroy from 'src/modules/testPlan/destroy/testPlanDestroyReducers';
import form from 'src/modules/testPlan/form/testPlanFormReducers';
import importerReducer from 'src/modules/testPlan/importer/testPlanImporterReducers';
import list from 'src/modules/testPlan/list/testPlanListReducers';
import view from 'src/modules/testPlan/view/testPlanViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

import { combineReducers } from 'redux';
import destroy from 'src/modules/scheduledEvent/destroy/scheduledEventDestroyReducers';
import form from 'src/modules/scheduledEvent/form/scheduledEventFormReducers';
import importerReducer from 'src/modules/scheduledEvent/importer/scheduledEventImporterReducers';
import list from 'src/modules/scheduledEvent/list/scheduledEventListReducers';
import view from 'src/modules/scheduledEvent/view/scheduledEventViewReducers';

export default combineReducers({
  list,
  form,
  view,
  destroy,
  importer: importerReducer,
});

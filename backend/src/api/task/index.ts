/// File is generated from https://studio.fabbuilder.com - task

import taskCreate from './taskCreate';
import taskUpdate from './taskUpdate';
import taskImport from './taskImport';
import taskDestroy from './taskDestroy';
import taskAutocomplete from './taskAutocomplete';
import taskCount from './taskCount';
import taskList from './taskList';
import taskFind from './taskFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/task`,
    taskCreate,
  );
  app.put(
    `/tenant/:tenantId/task/:id`,
    taskUpdate,
  );
  app.post(
    `/tenant/:tenantId/task/import`,
    taskImport,
  );
  app.delete(
    `/tenant/:tenantId/task`,
    taskDestroy,
  );
  app.get(
    `/tenant/:tenantId/task/autocomplete`,
    taskAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/task/count`,
    taskCount,
  );
  app.get(
    `/tenant/:tenantId/task`,
    taskList,
  );
  app.get(
    `/tenant/:tenantId/task/:id`,
    taskFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - task

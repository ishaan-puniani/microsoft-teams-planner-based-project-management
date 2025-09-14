/// File is generated from https://studio.fabbuilder.com - taskTemplate

import taskTemplateCreate from './taskTemplateCreate';
import taskTemplateUpdate from './taskTemplateUpdate';
import taskTemplateImport from './taskTemplateImport';
import taskTemplateDestroy from './taskTemplateDestroy';
import taskTemplateAutocomplete from './taskTemplateAutocomplete';
import taskTemplateCount from './taskTemplateCount';
import taskTemplateList from './taskTemplateList';
import taskTemplateFind from './taskTemplateFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/task-template`,
    taskTemplateCreate,
  );
  app.put(
    `/tenant/:tenantId/task-template/:id`,
    taskTemplateUpdate,
  );
  app.post(
    `/tenant/:tenantId/task-template/import`,
    taskTemplateImport,
  );
  app.delete(
    `/tenant/:tenantId/task-template`,
    taskTemplateDestroy,
  );
  app.get(
    `/tenant/:tenantId/task-template/autocomplete`,
    taskTemplateAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/task-template/count`,
    taskTemplateCount,
  );
  app.get(
    `/tenant/:tenantId/task-template`,
    taskTemplateList,
  );
  app.get(
    `/tenant/:tenantId/task-template/:id`,
    taskTemplateFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - taskTemplate

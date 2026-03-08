/// File is generated from https://studio.fabbuilder.com - task

import taskCreate from './taskCreate';
import taskBulkCreate from './taskBulkCreate';
import taskBulkUpdateEstimates from './taskBulkUpdateEstimates';
import taskPlanSave from './taskPlanSave';
import taskUpdate from './taskUpdate';
import taskImport from './taskImport';
import taskDestroy from './taskDestroy';
import taskAutocomplete from './taskAutocomplete';
import taskCount from './taskCount';
import taskList from './taskList';
import taskFind from './taskFind';
import aggregateEstimatesByProject from './reports/aggregateEstimatesByProject';

export default (app) => {
  app.post(
    `/tenant/:tenantId/task`,
    taskCreate,
  );
  app.post(
    `/tenant/:tenantId/task/bulk-create`,
    taskBulkCreate,
  );
  app.put(
    `/tenant/:tenantId/task/bulk-update-estimates`,
    taskBulkUpdateEstimates,
  );
  app.put(
    `/tenant/:tenantId/task/plan-save`,
    taskPlanSave,
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
  app.get(
    `/tenant/:tenantId/task/reports/aggregate-estimates`,
    aggregateEstimatesByProject,
  );
};
/// File is generated from https://studio.fabbuilder.com - task

/// File is generated from https://studio.fabbuilder.com - testPlan

import testPlanCreate from './testPlanCreate';
import testPlanUpdate from './testPlanUpdate';
import testPlanImport from './testPlanImport';
import testPlanDestroy from './testPlanDestroy';
import testPlanAutocomplete from './testPlanAutocomplete';
import testPlanCount from './testPlanCount';
import testPlanList from './testPlanList';
import testPlanFind from './testPlanFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/test-plan`,
    testPlanCreate,
  );
  app.put(
    `/tenant/:tenantId/test-plan/:id`,
    testPlanUpdate,
  );
  app.post(
    `/tenant/:tenantId/test-plan/import`,
    testPlanImport,
  );
  app.delete(
    `/tenant/:tenantId/test-plan`,
    testPlanDestroy,
  );
  app.get(
    `/tenant/:tenantId/test-plan/autocomplete`,
    testPlanAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/test-plan/count`,
    testPlanCount,
  );
  app.get(
    `/tenant/:tenantId/test-plan`,
    testPlanList,
  );
  app.get(
    `/tenant/:tenantId/test-plan/:id`,
    testPlanFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - testPlan

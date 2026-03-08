/// File is generated from https://studio.fabbuilder.com - testCycle

import testCycleAssignTestCases from './testCycleAssignTestCases';
import testCycleCreate from './testCycleCreate';
import testCycleUpdate from './testCycleUpdate';
import testCycleImport from './testCycleImport';
import testCycleDestroy from './testCycleDestroy';
import testCycleAutocomplete from './testCycleAutocomplete';
import testCycleCount from './testCycleCount';
import testCycleList from './testCycleList';
import testCycleFind from './testCycleFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/test-cycle`,
    testCycleCreate,
  );
  app.put(
    `/tenant/:tenantId/test-cycle/:id`,
    testCycleUpdate,
  );
  app.post(
    `/tenant/:tenantId/test-cycle/:id/assign-test-cases`,
    testCycleAssignTestCases,
  );
  app.post(
    `/tenant/:tenantId/test-cycle/import`,
    testCycleImport,
  );
  app.delete(
    `/tenant/:tenantId/test-cycle`,
    testCycleDestroy,
  );
  app.get(
    `/tenant/:tenantId/test-cycle/autocomplete`,
    testCycleAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/test-cycle/count`,
    testCycleCount,
  );
  app.get(
    `/tenant/:tenantId/test-cycle`,
    testCycleList,
  );
  app.get(
    `/tenant/:tenantId/test-cycle/:id`,
    testCycleFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - testCycle

/// File is generated from https://studio.fabbuilder.com - testSuite

import testSuiteCreate from './testSuiteCreate';
import testSuiteUpdate from './testSuiteUpdate';
import testSuiteImport from './testSuiteImport';
import testSuiteDestroy from './testSuiteDestroy';
import testSuiteAutocomplete from './testSuiteAutocomplete';
import testSuiteCount from './testSuiteCount';
import testSuiteList from './testSuiteList';
import testSuiteFind from './testSuiteFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/test-suite`,
    testSuiteCreate,
  );
  app.put(
    `/tenant/:tenantId/test-suite/:id`,
    testSuiteUpdate,
  );
  app.post(
    `/tenant/:tenantId/test-suite/import`,
    testSuiteImport,
  );
  app.delete(
    `/tenant/:tenantId/test-suite`,
    testSuiteDestroy,
  );
  app.get(
    `/tenant/:tenantId/test-suite/autocomplete`,
    testSuiteAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/test-suite/count`,
    testSuiteCount,
  );
  app.get(
    `/tenant/:tenantId/test-suite`,
    testSuiteList,
  );
  app.get(
    `/tenant/:tenantId/test-suite/:id`,
    testSuiteFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - testSuite

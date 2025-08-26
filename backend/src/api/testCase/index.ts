/// File is generated from https://studio.fabbuilder.com - testCase

import testCaseCreate from './testCaseCreate';
import testCaseUpdate from './testCaseUpdate';
import testCaseImport from './testCaseImport';
import testCaseDestroy from './testCaseDestroy';
import testCaseAutocomplete from './testCaseAutocomplete';
import testCaseCount from './testCaseCount';
import testCaseList from './testCaseList';
import testCaseFind from './testCaseFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/test-case`,
    testCaseCreate,
  );
  app.put(
    `/tenant/:tenantId/test-case/:id`,
    testCaseUpdate,
  );
  app.post(
    `/tenant/:tenantId/test-case/import`,
    testCaseImport,
  );
  app.delete(
    `/tenant/:tenantId/test-case`,
    testCaseDestroy,
  );
  app.get(
    `/tenant/:tenantId/test-case/autocomplete`,
    testCaseAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/test-case/count`,
    testCaseCount,
  );
  app.get(
    `/tenant/:tenantId/test-case`,
    testCaseList,
  );
  app.get(
    `/tenant/:tenantId/test-case/:id`,
    testCaseFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - testCase

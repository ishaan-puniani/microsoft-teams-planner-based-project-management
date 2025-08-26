/// File is generated from https://studio.fabbuilder.com - testCase

export default (app) => {
  app.post(
    `/tenant/:tenantId/test-case`,
    require('./testCaseCreate').default,
  );
  app.put(
    `/tenant/:tenantId/test-case/:id`,
    require('./testCaseUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/test-case/import`,
    require('./testCaseImport').default,
  );
  app.delete(
    `/tenant/:tenantId/test-case`,
    require('./testCaseDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/test-case/autocomplete`,
    require('./testCaseAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/test-case/count`,
    require('./testCaseCount').default,
  );
  app.get(
    `/tenant/:tenantId/test-case`,
    require('./testCaseList').default,
  );
  app.get(
    `/tenant/:tenantId/test-case/:id`,
    require('./testCaseFind').default,
  );
};
/// File is generated from https://studio.fabbuilder.com - testCase

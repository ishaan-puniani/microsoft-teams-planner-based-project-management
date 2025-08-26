/// File is generated from https://studio.fabbuilder.com - testSuite

export default (app) => {
  app.post(
    `/tenant/:tenantId/test-suite`,
    require('./testSuiteCreate').default,
  );
  app.put(
    `/tenant/:tenantId/test-suite/:id`,
    require('./testSuiteUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/test-suite/import`,
    require('./testSuiteImport').default,
  );
  app.delete(
    `/tenant/:tenantId/test-suite`,
    require('./testSuiteDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/test-suite/autocomplete`,
    require('./testSuiteAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/test-suite/count`,
    require('./testSuiteCount').default,
  );
  app.get(
    `/tenant/:tenantId/test-suite`,
    require('./testSuiteList').default,
  );
  app.get(
    `/tenant/:tenantId/test-suite/:id`,
    require('./testSuiteFind').default,
  );
};
/// File is generated from https://studio.fabbuilder.com - testSuite

/// File is generated from https://studio.fabbuilder.com - testPlan

export default (app) => {
  app.post(
    `/tenant/:tenantId/test-plan`,
    require('./testPlanCreate').default,
  );
  app.put(
    `/tenant/:tenantId/test-plan/:id`,
    require('./testPlanUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/test-plan/import`,
    require('./testPlanImport').default,
  );
  app.delete(
    `/tenant/:tenantId/test-plan`,
    require('./testPlanDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/test-plan/autocomplete`,
    require('./testPlanAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/test-plan/count`,
    require('./testPlanCount').default,
  );
  app.get(
    `/tenant/:tenantId/test-plan`,
    require('./testPlanList').default,
  );
  app.get(
    `/tenant/:tenantId/test-plan/:id`,
    require('./testPlanFind').default,
  );
};
/// File is generated from https://studio.fabbuilder.com - testPlan

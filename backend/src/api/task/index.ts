/// File is generated from https://studio.fabbuilder.com - task

export default (app) => {
  app.post(
    `/tenant/:tenantId/task`,
    require('./taskCreate').default,
  );
  app.put(
    `/tenant/:tenantId/task/:id`,
    require('./taskUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/task/import`,
    require('./taskImport').default,
  );
  app.delete(
    `/tenant/:tenantId/task`,
    require('./taskDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/task/autocomplete`,
    require('./taskAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/task/count`,
    require('./taskCount').default,
  );
  app.get(
    `/tenant/:tenantId/task`,
    require('./taskList').default,
  );
  app.get(
    `/tenant/:tenantId/task/:id`,
    require('./taskFind').default,
  );
};
/// File is generated from https://studio.fabbuilder.com - task

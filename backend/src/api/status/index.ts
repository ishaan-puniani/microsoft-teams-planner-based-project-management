/// File is generated from https://studio.fabbuilder.com - status

export default (app) => {
  app.post(
    `/tenant/:tenantId/status`,
    require('./statusCreate').default,
  );
  app.put(
    `/tenant/:tenantId/status/:id`,
    require('./statusUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/status/import`,
    require('./statusImport').default,
  );
  app.delete(
    `/tenant/:tenantId/status`,
    require('./statusDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/status/autocomplete`,
    require('./statusAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/status/count`,
    require('./statusCount').default,
  );
  app.get(
    `/tenant/:tenantId/status`,
    require('./statusList').default,
  );
  app.get(
    `/tenant/:tenantId/status/:id`,
    require('./statusFind').default,
  );
};
/// File is generated from https://studio.fabbuilder.com - status

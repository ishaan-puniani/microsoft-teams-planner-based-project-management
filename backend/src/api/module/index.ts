/// File is generated from https://studio.fabbuilder.com - module

export default (app) => {
  app.post(
    `/tenant/:tenantId/module`,
    require('./moduleCreate').default,
  );
  app.put(
    `/tenant/:tenantId/module/:id`,
    require('./moduleUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/module/import`,
    require('./moduleImport').default,
  );
  app.delete(
    `/tenant/:tenantId/module`,
    require('./moduleDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/module/autocomplete`,
    require('./moduleAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/module/count`,
    require('./moduleCount').default,
  );
  app.get(
    `/tenant/:tenantId/module`,
    require('./moduleList').default,
  );
  app.get(
    `/tenant/:tenantId/module/:id`,
    require('./moduleFind').default,
  );
};
/// File is generated from https://studio.fabbuilder.com - module

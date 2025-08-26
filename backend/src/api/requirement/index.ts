/// File is generated from https://studio.fabbuilder.com - requirement

export default (app) => {
  app.post(
    `/tenant/:tenantId/requirement`,
    require('./requirementCreate').default,
  );
  app.put(
    `/tenant/:tenantId/requirement/:id`,
    require('./requirementUpdate').default,
  );
  app.post(
    `/tenant/:tenantId/requirement/import`,
    require('./requirementImport').default,
  );
  app.delete(
    `/tenant/:tenantId/requirement`,
    require('./requirementDestroy').default,
  );
  app.get(
    `/tenant/:tenantId/requirement/autocomplete`,
    require('./requirementAutocomplete').default,
  );
  app.get(
    `/tenant/:tenantId/requirement/count`,
    require('./requirementCount').default,
  );
  app.get(
    `/tenant/:tenantId/requirement`,
    require('./requirementList').default,
  );
  app.get(
    `/tenant/:tenantId/requirement/:id`,
    require('./requirementFind').default,
  );
};
/// File is generated from https://studio.fabbuilder.com - requirement

/// File is generated from https://studio.fabbuilder.com - requirement

import requirementCreate from './requirementCreate';
import requirementUpdate from './requirementUpdate';
import requirementImport from './requirementImport';
import requirementDestroy from './requirementDestroy';
import requirementAutocomplete from './requirementAutocomplete';
import requirementCount from './requirementCount';
import requirementList from './requirementList';
import requirementFind from './requirementFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/requirement`,
    requirementCreate,
  );
  app.put(
    `/tenant/:tenantId/requirement/:id`,
    requirementUpdate,
  );
  app.post(
    `/tenant/:tenantId/requirement/import`,
    requirementImport,
  );
  app.delete(
    `/tenant/:tenantId/requirement`,
    requirementDestroy,
  );
  app.get(
    `/tenant/:tenantId/requirement/autocomplete`,
    requirementAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/requirement/count`,
    requirementCount,
  );
  app.get(
    `/tenant/:tenantId/requirement`,
    requirementList,
  );
  app.get(
    `/tenant/:tenantId/requirement/:id`,
    requirementFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - requirement

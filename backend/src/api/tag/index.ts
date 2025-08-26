/// File is generated from https://studio.fabbuilder.com - tag

import tagCreate from './tagCreate';
import tagUpdate from './tagUpdate';
import tagImport from './tagImport';
import tagDestroy from './tagDestroy';
import tagAutocomplete from './tagAutocomplete';
import tagCount from './tagCount';
import tagList from './tagList';
import tagFind from './tagFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/tag`,
    tagCreate,
  );
  app.put(
    `/tenant/:tenantId/tag/:id`,
    tagUpdate,
  );
  app.post(
    `/tenant/:tenantId/tag/import`,
    tagImport,
  );
  app.delete(
    `/tenant/:tenantId/tag`,
    tagDestroy,
  );
  app.get(
    `/tenant/:tenantId/tag/autocomplete`,
    tagAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/tag/count`,
    tagCount,
  );
  app.get(
    `/tenant/:tenantId/tag`,
    tagList,
  );
  app.get(
    `/tenant/:tenantId/tag/:id`,
    tagFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - tag

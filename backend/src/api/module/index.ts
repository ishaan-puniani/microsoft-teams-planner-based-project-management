/// File is generated from https://studio.fabbuilder.com - module

import moduleCreate from './moduleCreate';
import moduleUpdate from './moduleUpdate';
import moduleImport from './moduleImport';
import moduleDestroy from './moduleDestroy';
import moduleAutocomplete from './moduleAutocomplete';
import moduleCount from './moduleCount';
import moduleList from './moduleList';
import moduleFind from './moduleFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/module`,
    moduleCreate,
  );
  app.put(
    `/tenant/:tenantId/module/:id`,
    moduleUpdate,
  );
  app.post(
    `/tenant/:tenantId/module/import`,
    moduleImport,
  );
  app.delete(
    `/tenant/:tenantId/module`,
    moduleDestroy,
  );
  app.get(
    `/tenant/:tenantId/module/autocomplete`,
    moduleAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/module/count`,
    moduleCount,
  );
  app.get(
    `/tenant/:tenantId/module`,
    moduleList,
  );
  app.get(
    `/tenant/:tenantId/module/:id`,
    moduleFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - module

/// File is generated from https://studio.fabbuilder.com - status

import statusCreate from './statusCreate';
import statusUpdate from './statusUpdate';
import statusImport from './statusImport';
import statusDestroy from './statusDestroy';
import statusAutocomplete from './statusAutocomplete';
import statusCount from './statusCount';
import statusList from './statusList';
import statusFind from './statusFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/status`,
    statusCreate,
  );
  app.put(
    `/tenant/:tenantId/status/:id`,
    statusUpdate,
  );
  app.post(
    `/tenant/:tenantId/status/import`,
    statusImport,
  );
  app.delete(
    `/tenant/:tenantId/status`,
    statusDestroy,
  );
  app.get(
    `/tenant/:tenantId/status/autocomplete`,
    statusAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/status/count`,
    statusCount,
  );
  app.get(
    `/tenant/:tenantId/status`,
    statusList,
  );
  app.get(
    `/tenant/:tenantId/status/:id`,
    statusFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - status

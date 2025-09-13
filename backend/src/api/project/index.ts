/// File is generated from https://studio.fabbuilder.com - project

import projectCreate from './projectCreate';
import projectUpdate from './projectUpdate';
import projectImport from './projectImport';
import projectDestroy from './projectDestroy';
import projectAutocomplete from './projectAutocomplete';
import projectCount from './projectCount';
import projectList from './projectList';
import projectFind from './projectFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/project`,
    projectCreate,
  );
  app.put(
    `/tenant/:tenantId/project/:id`,
    projectUpdate,
  );
  app.post(
    `/tenant/:tenantId/project/import`,
    projectImport,
  );
  app.delete(
    `/tenant/:tenantId/project`,
    projectDestroy,
  );
  app.get(
    `/tenant/:tenantId/project/autocomplete`,
    projectAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/project/count`,
    projectCount,
  );
  app.get(
    `/tenant/:tenantId/project`,
    projectList,
  );
  app.get(
    `/tenant/:tenantId/project/:id`,
    projectFind,
  );
};
/// File is generated from https://studio.fabbuilder.com - project

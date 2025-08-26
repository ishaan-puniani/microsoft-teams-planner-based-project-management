import userCreate from './userCreate';
import userEdit from './userEdit';
import userImport from './userImport';
import userDestroy from './userDestroy';
import userList from './userList';
import userAutocomplete from './userAutocomplete';
import userFind from './userFind';

export default (app) => {
  app.post(
    `/tenant/:tenantId/user`,
    userCreate,
  );
  app.put(
    `/tenant/:tenantId/user`,
    userEdit,
  );
  app.post(
    `/tenant/:tenantId/user/import`,
    userImport,
  );
  app.delete(
    `/tenant/:tenantId/user`,
    userDestroy,
  );
  app.get(
    `/tenant/:tenantId/user`,
    userList,
  );
  app.get(
    `/tenant/:tenantId/user/autocomplete`,
    userAutocomplete,
  );
  app.get(
    `/tenant/:tenantId/user/:id`,
    userFind,
  );
};

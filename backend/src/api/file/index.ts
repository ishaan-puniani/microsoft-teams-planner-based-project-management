import upload from './localhost/upload';
import download from './localhost/download';
import credentials from './credentials';

export default (app) => {
  app.post(
    `/file/upload`,
    upload,
  );
  app.get(
    `/file/download`,
    download,
  );
  app.get(
    `/tenant/:tenantId/file/credentials`,
    credentials,
  );
};

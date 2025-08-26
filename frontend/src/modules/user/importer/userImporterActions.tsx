import { i18n } from 'src/i18n';
import importerActions from 'src/modules/shared/importer/importerActions';
import fields from 'src/modules/user/importer/userImporterFields';
import selectors from 'src/modules/user/importer/userImporterSelectors';
import UserService from 'src/modules/user/userService';

const userImporterActions = importerActions(
  'USER_IMPORTER',
  selectors,
  UserService.import,
  fields,
  i18n('user.importer.fileName'),
);

export default userImporterActions;

import { i18n } from 'src/i18n';
import importerActions from 'src/modules/shared/importer/importerActions';
import fields from 'src/modules/status/importer/statusImporterFields';
import selectors from 'src/modules/status/importer/statusImporterSelectors';
import StatusService from 'src/modules/status/statusService';

const statusImporterActions = importerActions(
  'STATUS_IMPORTER',
  selectors,
  StatusService.import,
  fields,
  i18n('entities.status.importer.fileName'),
);

export default statusImporterActions;

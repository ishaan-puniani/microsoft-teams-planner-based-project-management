import { i18n } from 'src/i18n';
import fields from 'src/modules/module/importer/moduleImporterFields';
import selectors from 'src/modules/module/importer/moduleImporterSelectors';
import ModuleService from 'src/modules/module/moduleService';
import importerActions from 'src/modules/shared/importer/importerActions';

const moduleImporterActions = importerActions(
  'MODULE_IMPORTER',
  selectors,
  ModuleService.import,
  fields,
  i18n('entities.module.importer.fileName'),
);

export default moduleImporterActions;

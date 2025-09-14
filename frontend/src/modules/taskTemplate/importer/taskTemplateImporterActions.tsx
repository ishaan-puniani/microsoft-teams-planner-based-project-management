import { i18n } from 'src/i18n';
import fields from 'src/modules/taskTemplate/importer/taskTemplateImporterFields';
import selectors from 'src/modules/taskTemplate/importer/taskTemplateImporterSelectors';
import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import importerActions from 'src/modules/shared/importer/importerActions';

const taskTemplateImporterActions = importerActions(
  'TASK_TEMPLATE_IMPORTER',
  selectors,
  TaskTemplateService.import,
  fields,
  i18n('entities.taskTemplate.importer.fileName'),
);

export default taskTemplateImporterActions;

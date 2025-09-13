import { i18n } from 'src/i18n';
import fields from 'src/modules/project/importer/projectImporterFields';
import selectors from 'src/modules/project/importer/projectImporterSelectors';
import ProjectService from 'src/modules/project/projectService';
import importerActions from 'src/modules/shared/importer/importerActions';

const projectImporterActions = importerActions(
  'PROJECT_IMPORTER',
  selectors,
  ProjectService.import,
  fields,
  i18n('entities.project.importer.fileName'),
);

export default projectImporterActions;

import { i18n } from 'src/i18n';
import fields from 'src/modules/requirement/importer/requirementImporterFields';
import selectors from 'src/modules/requirement/importer/requirementImporterSelectors';
import RequirementService from 'src/modules/requirement/requirementService';
import importerActions from 'src/modules/shared/importer/importerActions';

const requirementImporterActions = importerActions(
  'REQUIREMENT_IMPORTER',
  selectors,
  RequirementService.import,
  fields,
  i18n('entities.requirement.importer.fileName'),
);

export default requirementImporterActions;

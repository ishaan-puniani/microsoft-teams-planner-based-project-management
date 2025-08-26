import { i18n } from 'src/i18n';
import importerActions from 'src/modules/shared/importer/importerActions';
import fields from 'src/modules/testPlan/importer/testPlanImporterFields';
import selectors from 'src/modules/testPlan/importer/testPlanImporterSelectors';
import TestPlanService from 'src/modules/testPlan/testPlanService';

const testPlanImporterActions = importerActions(
  'TESTPLAN_IMPORTER',
  selectors,
  TestPlanService.import,
  fields,
  i18n('entities.testPlan.importer.fileName'),
);

export default testPlanImporterActions;

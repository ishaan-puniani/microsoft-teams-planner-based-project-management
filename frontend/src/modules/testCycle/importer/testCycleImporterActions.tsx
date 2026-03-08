import { i18n } from 'src/i18n';
import importerActions from 'src/modules/shared/importer/importerActions';
import fields from './testCycleImporterFields';
import selectors from './testCycleImporterSelectors';
import TestCycleService from 'src/modules/testCycle/testCycleService';

const testCycleImporterActions = importerActions(
  'TESTCYCLE_IMPORTER',
  selectors,
  TestCycleService.import,
  fields,
  i18n('entities.testCycle.importer.fileName'),
);

export default testCycleImporterActions;

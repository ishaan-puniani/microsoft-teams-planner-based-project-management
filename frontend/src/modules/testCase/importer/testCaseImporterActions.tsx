import { i18n } from 'src/i18n';
import importerActions from 'src/modules/shared/importer/importerActions';
import fields from 'src/modules/testCase/importer/testCaseImporterFields';
import selectors from 'src/modules/testCase/importer/testCaseImporterSelectors';
import TestCaseService from 'src/modules/testCase/testCaseService';

const testCaseImporterActions = importerActions(
  'TESTCASE_IMPORTER',
  selectors,
  TestCaseService.import,
  fields,
  i18n('entities.testCase.importer.fileName'),
);

export default testCaseImporterActions;

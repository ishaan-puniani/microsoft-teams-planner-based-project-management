import { i18n } from 'src/i18n';
import importerActions from 'src/modules/shared/importer/importerActions';
import fields from 'src/modules/testSuite/importer/testSuiteImporterFields';
import selectors from 'src/modules/testSuite/importer/testSuiteImporterSelectors';
import TestSuiteService from 'src/modules/testSuite/testSuiteService';

const testSuiteImporterActions = importerActions(
  'TESTSUITE_IMPORTER',
  selectors,
  TestSuiteService.import,
  fields,
  i18n('entities.testSuite.importer.fileName'),
);

export default testSuiteImporterActions;

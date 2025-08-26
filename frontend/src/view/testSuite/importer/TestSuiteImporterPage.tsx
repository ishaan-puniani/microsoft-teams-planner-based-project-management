import { i18n } from 'src/i18n';
import actions from 'src/modules/testSuite/importer/testSuiteImporterActions';
import fields from 'src/modules/testSuite/importer/testSuiteImporterFields';
import selectors from 'src/modules/testSuite/importer/testSuiteImporterSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import importerHoc from 'src/view/shared/importer/Importer';
import PageTitle from 'src/view/shared/styles/PageTitle';

const TestSuiteImportPage = (props) => {
  const Importer = importerHoc(
    selectors,
    actions,
    fields,
    i18n('entities.testSuite.importer.hint'),
  );
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.testSuite.menu'), '/test-suite'],
          [i18n('entities.testSuite.importer.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testSuite.importer.title')}
        </PageTitle>

        <Importer />
      </ContentWrapper>
    </>
  );
};

export default TestSuiteImportPage;

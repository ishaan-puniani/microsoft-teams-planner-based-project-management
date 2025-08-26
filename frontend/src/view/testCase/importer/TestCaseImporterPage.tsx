import { i18n } from 'src/i18n';
import actions from 'src/modules/testCase/importer/testCaseImporterActions';
import fields from 'src/modules/testCase/importer/testCaseImporterFields';
import selectors from 'src/modules/testCase/importer/testCaseImporterSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import importerHoc from 'src/view/shared/importer/Importer';
import PageTitle from 'src/view/shared/styles/PageTitle';

const TestCaseImportPage = (props) => {
  const Importer = importerHoc(
    selectors,
    actions,
    fields,
    i18n('entities.testCase.importer.hint'),
  );
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.testCase.menu'), '/test-case'],
          [i18n('entities.testCase.importer.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testCase.importer.title')}
        </PageTitle>

        <Importer />
      </ContentWrapper>
    </>
  );
};

export default TestCaseImportPage;

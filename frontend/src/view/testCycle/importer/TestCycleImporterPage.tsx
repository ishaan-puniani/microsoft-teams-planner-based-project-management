import { i18n } from 'src/i18n';
import actions from 'src/modules/testCycle/importer/testCycleImporterActions';
import fields from 'src/modules/testCycle/importer/testCycleImporterFields';
import selectors from 'src/modules/testCycle/importer/testCycleImporterSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import importerHoc from 'src/view/shared/importer/Importer';
import PageTitle from 'src/view/shared/styles/PageTitle';

const TestCycleImporterPage = (props) => {
  const Importer = importerHoc(
    selectors,
    actions,
    fields,
    i18n('entities.testCycle.importer.hint'),
  );
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.testCycle.menu'), '/test-cycle'],
          [i18n('entities.testCycle.importer.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testCycle.importer.title')}
        </PageTitle>

        <Importer />
      </ContentWrapper>
    </>
  );
};

export default TestCycleImporterPage;

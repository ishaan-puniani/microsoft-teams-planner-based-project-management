import { i18n } from 'src/i18n';
import actions from 'src/modules/testPlan/importer/testPlanImporterActions';
import fields from 'src/modules/testPlan/importer/testPlanImporterFields';
import selectors from 'src/modules/testPlan/importer/testPlanImporterSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import importerHoc from 'src/view/shared/importer/Importer';
import PageTitle from 'src/view/shared/styles/PageTitle';

const TestPlanImportPage = (props) => {
  const Importer = importerHoc(
    selectors,
    actions,
    fields,
    i18n('entities.testPlan.importer.hint'),
  );
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.testPlan.menu'), '/test-plan'],
          [i18n('entities.testPlan.importer.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testPlan.importer.title')}
        </PageTitle>

        <Importer />
      </ContentWrapper>
    </>
  );
};

export default TestPlanImportPage;

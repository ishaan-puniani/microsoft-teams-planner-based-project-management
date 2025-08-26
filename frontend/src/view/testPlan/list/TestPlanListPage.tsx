import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TestPlanListFilter from 'src/view/testPlan/list/TestPlanListFilter';
import TestPlanListTable from 'src/view/testPlan/list/TestPlanListTable';
import TestPlanListToolbar from 'src/view/testPlan/list/TestPlanListToolbar';

const TestPlanListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.testPlan.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testPlan.list.title')}
        </PageTitle>

        <TestPlanListToolbar />
        <TestPlanListFilter />
        <TestPlanListTable />
      </ContentWrapper>
    </>
  );
};

export default TestPlanListPage;

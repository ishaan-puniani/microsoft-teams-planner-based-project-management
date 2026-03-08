import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TestCycleListFilter from 'src/view/testCycle/list/TestCycleListFilter';
import TestCycleListTable from 'src/view/testCycle/list/TestCycleListTable';
import TestCycleListToolbar from 'src/view/testCycle/list/TestCycleListToolbar';

const TestCycleListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.testCycle.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testCycle.list.title')}
        </PageTitle>

        <TestCycleListToolbar />
        <TestCycleListFilter />
        <TestCycleListTable />
      </ContentWrapper>
    </>
  );
};

export default TestCycleListPage;

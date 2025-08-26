import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TestCaseListFilter from 'src/view/testCase/list/TestCaseListFilter';
import TestCaseListTable from 'src/view/testCase/list/TestCaseListTable';
import TestCaseListToolbar from 'src/view/testCase/list/TestCaseListToolbar';

const TestCaseListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.testCase.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testCase.list.title')}
        </PageTitle>

        <TestCaseListToolbar />
        <TestCaseListFilter />
        <TestCaseListTable />
      </ContentWrapper>
    </>
  );
};

export default TestCaseListPage;

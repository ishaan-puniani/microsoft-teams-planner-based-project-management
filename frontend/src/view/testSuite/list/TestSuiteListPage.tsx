import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TestSuiteListFilter from 'src/view/testSuite/list/TestSuiteListFilter';
import TestSuiteListTable from 'src/view/testSuite/list/TestSuiteListTable';
import TestSuiteListToolbar from 'src/view/testSuite/list/TestSuiteListToolbar';

const TestSuiteListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.testSuite.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testSuite.list.title')}
        </PageTitle>

        <TestSuiteListToolbar />
        <TestSuiteListFilter />
        <TestSuiteListTable />
      </ContentWrapper>
    </>
  );
};

export default TestSuiteListPage;

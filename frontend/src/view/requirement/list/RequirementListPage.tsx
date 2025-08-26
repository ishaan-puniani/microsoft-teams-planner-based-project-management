import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import RequirementListFilter from 'src/view/requirement/list/RequirementListFilter';
import RequirementListTable from 'src/view/requirement/list/RequirementListTable';
import RequirementListToolbar from 'src/view/requirement/list/RequirementListToolbar';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';

const RequirementListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.requirement.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.requirement.list.title')}
        </PageTitle>

        <RequirementListToolbar />
        <RequirementListFilter />
        <RequirementListTable />
      </ContentWrapper>
    </>
  );
};

export default RequirementListPage;

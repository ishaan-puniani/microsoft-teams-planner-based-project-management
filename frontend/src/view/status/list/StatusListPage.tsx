import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import StatusListFilter from 'src/view/status/list/StatusListFilter';
import StatusListTable from 'src/view/status/list/StatusListTable';
import StatusListToolbar from 'src/view/status/list/StatusListToolbar';

const StatusListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.status.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.status.list.title')}
        </PageTitle>

        <StatusListToolbar />
        <StatusListFilter />
        <StatusListTable />
      </ContentWrapper>
    </>
  );
};

export default StatusListPage;

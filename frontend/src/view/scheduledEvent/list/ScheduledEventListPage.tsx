import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import ScheduledEventListFilter from 'src/view/scheduledEvent/list/ScheduledEventListFilter';
import ScheduledEventListTable from 'src/view/scheduledEvent/list/ScheduledEventListTable';
import ScheduledEventListToolbar from 'src/view/scheduledEvent/list/ScheduledEventListToolbar';
import ScheduledEventCurrentlyRunning from 'src/view/scheduledEvent/list/ScheduledEventCurrentlyRunning';
import ScheduledEventUpcoming from 'src/view/scheduledEvent/list/ScheduledEventUpcoming';

const ScheduledEventListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.scheduledEvent.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.scheduledEvent.list.title')}
        </PageTitle>
        <ScheduledEventCurrentlyRunning/>
        <ScheduledEventUpcoming inHours={36}/>
        <ScheduledEventListToolbar />
        <ScheduledEventListFilter />
        <ScheduledEventListTable />
      </ContentWrapper>
    </>
  );
};

export default ScheduledEventListPage;

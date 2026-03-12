import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/scheduledEvent/view/scheduledEventViewActions';
import selectors from 'src/modules/scheduledEvent/view/scheduledEventViewSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import ScheduledEventView from 'src/view/scheduledEvent/view/ScheduledEventView';
import ScheduledEventViewToolbar from 'src/view/scheduledEvent/view/ScheduledEventViewToolbar';

const ScheduledEventViewPage = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();

  const loading = useSelector(selectors.selectLoading);
  const record = useSelector(selectors.selectRecord);

  useEffect(() => {
    dispatch(actions.doFind(id));
  }, [dispatch, id]);

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.scheduledEvent.menu'), '/scheduled-event'],
          [i18n('entities.scheduledEvent.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.scheduledEvent.view.title')}
        </PageTitle>

        <ScheduledEventViewToolbar id={id} />

        <ScheduledEventView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default ScheduledEventViewPage;

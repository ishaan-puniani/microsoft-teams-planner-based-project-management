import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/status/view/statusViewActions';
import selectors from 'src/modules/status/view/statusViewSelectors';
import { AppDispatch } from 'src/modules/store';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import StatusView from 'src/view/status/view/StatusView';
import StatusViewToolbar from 'src/view/status/view/StatusViewToolbar';

const StatusPage = (props) => {
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
          [i18n('entities.status.menu'), '/status'],
          [i18n('entities.status.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.status.view.title')}
        </PageTitle>

        <StatusViewToolbar id={id} />

        <StatusView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default StatusPage;

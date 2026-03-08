import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/testCycle/view/testCycleViewActions';
import selectors from 'src/modules/testCycle/view/testCycleViewSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TestCycleView from 'src/view/testCycle/view/TestCycleView';
import TestCycleViewToolbar from 'src/view/testCycle/view/TestCycleViewToolbar';

const TestCycleViewPage = (props) => {
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
          [i18n('entities.testCycle.menu'), '/test-cycle'],
          [i18n('entities.testCycle.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testCycle.view.title')}
        </PageTitle>

        <TestCycleViewToolbar id={id} />

        <TestCycleView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default TestCycleViewPage;

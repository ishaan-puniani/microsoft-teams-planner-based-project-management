import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/testPlan/view/testPlanViewActions';
import selectors from 'src/modules/testPlan/view/testPlanViewSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TestPlanView from 'src/view/testPlan/view/TestPlanView';
import TestPlanViewToolbar from 'src/view/testPlan/view/TestPlanViewToolbar';

const TestPlanPage = (props) => {
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
          [i18n('entities.testPlan.menu'), '/test-plan'],
          [i18n('entities.testPlan.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testPlan.view.title')}
        </PageTitle>

        <TestPlanViewToolbar id={id} />

        <TestPlanView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default TestPlanPage;

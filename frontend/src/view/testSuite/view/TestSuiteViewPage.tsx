import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/testSuite/view/testSuiteViewActions';
import selectors from 'src/modules/testSuite/view/testSuiteViewSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TestSuiteView from 'src/view/testSuite/view/TestSuiteView';
import TestSuiteViewToolbar from 'src/view/testSuite/view/TestSuiteViewToolbar';

const TestSuitePage = (props) => {
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
          [i18n('entities.testSuite.menu'), '/test-suite'],
          [i18n('entities.testSuite.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testSuite.view.title')}
        </PageTitle>

        <TestSuiteViewToolbar id={id} />

        <TestSuiteView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default TestSuitePage;

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/testCase/view/testCaseViewActions';
import selectors from 'src/modules/testCase/view/testCaseViewSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TestCaseView from 'src/view/testCase/view/TestCaseView';
import TestCaseViewToolbar from 'src/view/testCase/view/TestCaseViewToolbar';

const TestCasePage = (props) => {
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
          [i18n('entities.testCase.menu'), '/test-case'],
          [i18n('entities.testCase.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.testCase.view.title')}
        </PageTitle>

        <TestCaseViewToolbar id={id} />

        <TestCaseView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default TestCasePage;

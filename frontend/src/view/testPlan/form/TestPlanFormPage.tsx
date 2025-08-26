import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch, getHistory } from 'src/modules/store';
import actions from 'src/modules/testPlan/form/testPlanFormActions';
import selectors from 'src/modules/testPlan/form/testPlanFormSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import Spinner from 'src/view/shared/Spinner';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TestPlanForm from 'src/view/testPlan/form/TestPlanForm';

const TestPlanFormPage = (props) => {
  const [dispatched, setDispatched] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();

  const initLoading = useSelector(
    selectors.selectInitLoading,
  );
  const saveLoading = useSelector(
    selectors.selectSaveLoading,
  );
  const record = useSelector(selectors.selectRecord);

  const isEditing = Boolean(id);
  const title = isEditing
    ? i18n('entities.testPlan.edit.title')
    : i18n('entities.testPlan.new.title');

  useEffect(() => {
    dispatch(actions.doInit(id));
    setDispatched(true);
  }, [dispatch, id]);

  const doSubmit = (id, data) => {
    if (isEditing) {
      dispatch(actions.doUpdate(id, data));
    } else {
      dispatch(actions.doCreate(data));
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.testPlan.menu'), '/test-plan'],
          [title],
        ]}
      />

      <ContentWrapper>
        <PageTitle>{title}</PageTitle>

        {initLoading && <Spinner />}

        {dispatched && !initLoading && (
          <TestPlanForm
            saveLoading={saveLoading}
            initLoading={initLoading}
            record={record}
            isEditing={isEditing}
            onSubmit={doSubmit}
            onCancel={() => getHistory().push('/test-plan')}
          />
        )}
      </ContentWrapper>
    </>
  );
};

export default TestPlanFormPage;

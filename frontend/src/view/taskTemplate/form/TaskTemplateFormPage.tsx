import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/taskTemplate/form/taskTemplateFormActions';
import selectors from 'src/modules/taskTemplate/form/taskTemplateFormSelectors';
import { AppDispatch, getHistory } from 'src/modules/store';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import TaskTemplateForm from 'src/view/taskTemplate/form/TaskTemplateForm';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import Spinner from 'src/view/shared/Spinner';
import PageTitle from 'src/view/shared/styles/PageTitle';

const TaskTemplateFormPage = (props) => {
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
    ? i18n('entities.taskTemplate.edit.title')
    : i18n('entities.taskTemplate.new.title');

  useEffect(() => {
    dispatch(actions.doInit(id));
    setDispatched(true);
  }, [dispatch, id]);

  const doSubmit = (id, values) => {
    if (isEditing) {
      dispatch(actions.doUpdate(id, values));
    } else {
      dispatch(actions.doCreate(values));
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.taskTemplate.menu'), '/task-template'],
          [title],
        ]}
      />

      <ContentWrapper>
        <PageTitle>{title}</PageTitle>

        {initLoading && <Spinner />}

        {dispatched && !initLoading && (
          <TaskTemplateForm
            saveLoading={saveLoading}
            initLoading={initLoading}
            record={record}
            isEditing={isEditing}
            onSubmit={doSubmit}
            onCancel={() => getHistory().push('/task-template')}
          />
        )}
      </ContentWrapper>
    </>
  );
};

export default TaskTemplateFormPage;

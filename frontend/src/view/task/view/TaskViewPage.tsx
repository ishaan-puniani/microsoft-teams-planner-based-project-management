import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/task/view/taskViewActions';
import selectors from 'src/modules/task/view/taskViewSelectors';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TaskView from 'src/view/task/view/TaskView';
import TaskViewToolbar from 'src/view/task/view/TaskViewToolbar';

const TaskPage = (props) => {
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
          [i18n('entities.task.menu'), '/task'],
          [i18n('entities.task.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.task.view.title')}
        </PageTitle>

        <TaskViewToolbar id={id} />

        <TaskView loading={loading} record={record} />
      </ContentWrapper>
    </>
  );
};

export default TaskPage;

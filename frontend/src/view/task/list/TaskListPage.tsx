import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/task/list/taskListActions';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TaskListFilter from 'src/view/task/list/TaskListFilter';
import TaskListTable from 'src/view/task/list/TaskListTable';
import TaskListToolbar from 'src/view/task/list/TaskListToolbar';

const TaskListPage = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const search = location.search || '';

  // When opened as "Test Cases" (/task?type=TEST_CASE), apply filter so only TEST_CASE tasks show
  useEffect(() => {
    if (search.includes('type=TEST_CASE')) {
      dispatch(
        actions.doFetch(
          { type: 'TEST_CASE' },
          { type: 'TEST_CASE' },
          false,
        ),
      );
    }
  }, [dispatch, search]);

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.task.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.task.list.title')}
        </PageTitle>

        <TaskListToolbar />
        <TaskListFilter />
        <TaskListTable />
      </ContentWrapper>
    </>
  );
};

export default TaskListPage;

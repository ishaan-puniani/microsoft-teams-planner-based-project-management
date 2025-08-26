import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TaskListFilter from 'src/view/task/list/TaskListFilter';
import TaskListTable from 'src/view/task/list/TaskListTable';
import TaskListToolbar from 'src/view/task/list/TaskListToolbar';

const TaskListPage = (props) => {
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

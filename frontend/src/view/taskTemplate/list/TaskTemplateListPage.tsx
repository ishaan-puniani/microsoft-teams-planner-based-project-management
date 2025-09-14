import { i18n } from 'src/i18n';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import TaskTemplateListFilter from 'src/view/taskTemplate/list/TaskTemplateListFilter';
import TaskTemplateListTable from 'src/view/taskTemplate/list/TaskTemplateListTable';
import TaskTemplateListToolbar from 'src/view/taskTemplate/list/TaskTemplateListToolbar';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';

const TaskTemplateListPage = (props) => {
  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.taskTemplate.menu')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.taskTemplate.list.title')}
        </PageTitle>

        <TaskTemplateListToolbar />
        <TaskTemplateListFilter />
        <TaskTemplateListTable />
      </ContentWrapper>
    </>
  );
};

export default TaskTemplateListPage;

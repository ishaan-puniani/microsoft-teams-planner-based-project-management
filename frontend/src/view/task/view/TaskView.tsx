import moment from 'moment';
import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import FilesViewItem from 'src/view/shared/view/FilesViewItem';
import TextViewItem from 'src/view/shared/view/TextViewItem';
import UserViewItem from 'src/view/user/view/UserViewItem';
import TaskViewItem from 'src/view/task/view/TaskViewItem';

/** Child task type and project template for the Excel children grid. Only defined when the viewed task can have children. */
export type ChildTypeConfig = {
  type: 'USER_STORY' | 'TASK' | 'TEST_CASE';
  templateId: string | null;
};

export function getChildTypeAndTemplate(record: {
  type?: string | null;
  project?: { userStoryTemplate?: any; taskTemplate?: any; testCaseTemplate?: any } | null;
} | null): ChildTypeConfig | null {
  if (!record?.type || !record?.project) return null;
  const project = record.project;
  const templateId = (t: any) => (t?.id != null ? t.id : t);
  switch (String(record.type).toUpperCase()) {
    case 'EPIC':
      return { type: 'USER_STORY', templateId: templateId(project.userStoryTemplate) ?? null };
    case 'USER_STORY':
      return { type: 'TASK', templateId: templateId(project.taskTemplate) ?? null };
    case 'TASK':
      return { type: 'TEST_CASE', templateId: templateId(project.testCaseTemplate) ?? null };
    default:
      return null;
  }
}

function normalizeParentsForView(parents) {
  if (!parents || !Array.isArray(parents)) return [];
  return parents.map((p) => (typeof p === 'object' && p != null && 'id' in p ? p : { id: p }));
}

const TaskView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      <TextViewItem
        label={i18n('entities.task.fields.type')}
        value={record.type}
      />

      <TextViewItem
        label={i18n('entities.task.fields.title')}
        value={record.title}
      />

      <TextViewItem
        label={i18n('entities.task.fields.description')}
        value={record.description}
      />

      <TaskViewItem
        label={i18n('entities.task.fields.parents')}
        value={normalizeParentsForView(record.parents)}
      />

      <FilesViewItem
        label={i18n('entities.task.fields.attachment')}
        value={record.attachment}
      />

      <UserViewItem
        label={i18n('entities.task.fields.leadBy')}
        value={record.leadBy}
      />

      <UserViewItem
        label={i18n('entities.task.fields.reviewedBy')}
        value={record.reviewedBy}
      />

      <TextViewItem
        label={i18n('entities.task.fields.estimatedStart')}
        value={moment(record.estimatedStart).format(
          'YYYY-MM-DD HH:mm',
        )}
      />

      <TextViewItem
        label={i18n('entities.task.fields.estimatedEnd')}
        value={moment(record.estimatedEnd).format(
          'YYYY-MM-DD HH:mm',
        )}
      />

      <TextViewItem
        label={i18n('entities.task.fields.workStart')}
        value={moment(record.workStart).format(
          'YYYY-MM-DD HH:mm',
        )}
      />

      <TextViewItem
        label={i18n('entities.task.fields.workEnd')}
        value={moment(record.workEnd).format(
          'YYYY-MM-DD HH:mm',
        )}
      />
    </ViewWrapper>
  );
};

export default TaskView;

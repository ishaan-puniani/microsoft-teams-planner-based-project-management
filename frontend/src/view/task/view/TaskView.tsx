import moment from 'moment';
import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import FilesViewItem from 'src/view/shared/view/FilesViewItem';
import TextViewItem from 'src/view/shared/view/TextViewItem';
import UserViewItem from 'src/view/user/view/UserViewItem';

const TaskView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      <TextViewItem
        label={i18n('entities.task.fields.title')}
        value={record.title}
      />

      <TextViewItem
        label={i18n('entities.task.fields.description')}
        value={record.description}
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

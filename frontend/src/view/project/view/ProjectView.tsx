import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import TextViewItem from 'src/view/shared/view/TextViewItem';
import DateViewItem from 'src/view/shared/view/DateViewItem';

const ProjectView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      <TextViewItem
        label={i18n('entities.project.fields.name')}
        value={record.name}
      />

      <TextViewItem
        label={i18n('entities.project.fields.description')}
        value={record.description}
      />

      <DateViewItem
        label={i18n('entities.project.fields.startDate')}
        value={record.startDate}
      />

      <DateViewItem
        label={i18n('entities.project.fields.endDate')}
        value={record.endDate}
      />

      <TextViewItem
        label={i18n('entities.project.fields.status')}
        value={record.status}
      />

      <TextViewItem
        label={i18n('entities.project.fields.priority')}
        value={record.priority}
      />
    </ViewWrapper>
  );
};

export default ProjectView;

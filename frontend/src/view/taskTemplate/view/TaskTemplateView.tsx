import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import TextViewItem from 'src/view/shared/view/TextViewItem';

const TaskTemplateView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      <TextViewItem
        label={i18n('entities.taskTemplate.fields.name')}
        value={record.name}
      />

      <TextViewItem
        label={i18n('entities.taskTemplate.fields.description')}
        value={record.description}
      />

      <TextViewItem
        label={i18n('entities.taskTemplate.fields.type')}
        value={record.type ? i18n(`entities.taskTemplate.enumerators.type.${record.type}`) : null}
      />

      <TextViewItem
        label={i18n('entities.taskTemplate.fields.isActive')}
        value={record.isActive ? i18n('common.yes') : i18n('common.no')}
      />
    </ViewWrapper>
  );
};

export default TaskTemplateView;

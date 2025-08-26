import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import TextViewItem from 'src/view/shared/view/TextViewItem';

const ModuleView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      <TextViewItem
        label={i18n('entities.module.fields.title')}
        value={record.title}
      />

      <TextViewItem
        label={i18n('entities.module.fields.details')}
        value={record.details}
      />
    </ViewWrapper>
  );
};

export default ModuleView;

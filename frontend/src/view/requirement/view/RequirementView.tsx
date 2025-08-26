import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import TextViewItem from 'src/view/shared/view/TextViewItem';

const RequirementView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      <TextViewItem
        label={i18n('entities.requirement.fields.title')}
        value={record.title}
      />

      <TextViewItem
        label={i18n(
          'entities.requirement.fields.background',
        )}
        value={record.background}
      />

      <TextViewItem
        label={i18n(
          'entities.requirement.fields.acceptanceCriteria',
        )}
        value={record.acceptanceCriteria}
      />
    </ViewWrapper>
  );
};

export default RequirementView;

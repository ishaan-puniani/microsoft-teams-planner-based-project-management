import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import TextViewItem from 'src/view/shared/view/TextViewItem';

const TestPlanView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      <TextViewItem
        label={i18n('entities.testPlan.fields.title')}
        value={record.title}
      />

      <TextViewItem
        label={i18n('entities.testPlan.fields.scope')}
        value={record.scope}
      />

      <TextViewItem
        label={i18n('entities.testPlan.fields.objective')}
        value={record.objective}
      />
    </ViewWrapper>
  );
};

export default TestPlanView;

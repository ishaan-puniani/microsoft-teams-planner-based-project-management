import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import FilesViewItem from 'src/view/shared/view/FilesViewItem';
import TextViewItem from 'src/view/shared/view/TextViewItem';
import UserViewItem from 'src/view/user/view/UserViewItem';

const TestCaseView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      <TextViewItem
        label={i18n('entities.testCase.fields.title')}
        value={record.title}
      />

      <TextViewItem
        label={i18n('entities.testCase.fields.description')}
        value={record.description}
      />

      <FilesViewItem
        label={i18n('entities.testCase.fields.attachment')}
        value={record.attachment}
      />

      <UserViewItem
        label={i18n('entities.testCase.fields.leadBy')}
        value={record.leadBy}
      />

      <UserViewItem
        label={i18n('entities.testCase.fields.reviewedBy')}
        value={record.reviewedBy}
      />
    </ViewWrapper>
  );
};

export default TestCaseView;

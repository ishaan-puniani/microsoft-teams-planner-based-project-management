import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import FilesViewItem from 'src/view/shared/view/FilesViewItem';
import TextViewItem from 'src/view/shared/view/TextViewItem';
import TaskViewItem from 'src/view/task/view/TaskViewItem';
import UserViewItem from 'src/view/user/view/UserViewItem';

const TestCaseView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  const stepsValue = record.steps != null
    ? (typeof record.steps === 'string' ? record.steps : String(record.steps))
    : '';
  const expectedResultValue = record.expectedResult != null
    ? (typeof record.expectedResult === 'string' ? record.expectedResult : String(record.expectedResult))
    : '';

  return (
    <ViewWrapper>
      <TaskViewItem
        label={i18n('entities.testCase.fields.task')}
        value={record.task}
      />

      <TextViewItem
        label={i18n('entities.testCase.fields.title')}
        value={record.title}
      />

      <TextViewItem
        label={i18n('entities.testCase.fields.description')}
        value={record.description}
      />

      <div className="form-group">
        <label className="col-form-label">
          {i18n('entities.testCase.fields.steps')}
        </label>
        <div
          className="form-control-plaintext text-pre-wrap border rounded p-2 bg-light"
          style={{ minHeight: 80, whiteSpace: 'pre-wrap' }}
        >
          {stepsValue || ''}
        </div>
      </div>

      <div className="form-group">
        <label className="col-form-label">
          {i18n('entities.testCase.fields.expectedResult')}
        </label>
        <div
          className="form-control-plaintext text-pre-wrap border rounded p-2 bg-light"
          style={{ minHeight: 80, whiteSpace: 'pre-wrap' }}
        >
          {expectedResultValue || ''}
        </div>
      </div>

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

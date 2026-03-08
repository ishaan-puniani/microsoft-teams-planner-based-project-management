import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import TextViewItem from 'src/view/shared/view/TextViewItem';
import ProjectViewItem from 'src/view/project/view/ProjectViewItem';
import UserViewItem from 'src/view/user/view/UserViewItem';
import TestResultExcelView from 'src/view/testCycle/view/TestResultExcelView';

const TestCycleView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  const testResultsCount = Array.isArray(record.testResults)
    ? record.testResults.length
    : 0;

  return (
    <ViewWrapper>
      {record.project && typeof record.project === 'object' ? (
        <ProjectViewItem
          label={i18n('entities.testCycle.fields.project')}
          value={record.project}
        />
      ) : (
        <TextViewItem
          label={i18n('entities.testCycle.fields.project')}
          value={record.project ?? null}
        />
      )}

      <TextViewItem
        label={i18n('entities.testCycle.fields.key')}
        value={record.key}
      />

      <TextViewItem
        label={i18n('entities.testCycle.fields.title')}
        value={record.title}
      />

      <UserViewItem
        label={i18n('entities.testCycle.fields.leadBy')}
        value={record.leadBy}
      />

      <TextViewItem
        label={i18n('entities.testCycle.fields.testResults')}
        value={testResultsCount > 0 ? `${testResultsCount} result(s)` : '0'}
      />

      <TestResultExcelView testCycleId={record.id} />
    </ViewWrapper>
  );
};

export default TestCycleView;

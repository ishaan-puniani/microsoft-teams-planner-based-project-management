import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import TextViewItem from 'src/view/shared/view/TextViewItem';
import ProjectViewItem from 'src/view/project/view/ProjectViewItem';

const TagView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      {record.project && typeof record.project === 'object' && (
        <div style={{ marginBottom: '16px' }}>
          <label className="col-form-label">
            {i18n('entities.tag.fields.project')}
          </label>
          <ProjectViewItem value={record.project} />
        </div>
      )}
      {record.project && typeof record.project !== 'object' && (
        <TextViewItem
          label={i18n('entities.tag.fields.project')}
          value={record.project}
        />
      )}
      <TextViewItem
        label={i18n('entities.tag.fields.title')}
        value={record.title}
      />
    </ViewWrapper>
  );
};

export default TagView;

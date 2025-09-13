import { Link } from 'react-router-dom';
import { i18n } from 'src/i18n';

const ProjectViewItem = (props) => {
  const { value } = props;

  return (
    <div className="view-item">
      <div className="view-item-header">
        <h3>
          <Link to={`/project/${value.id}`}>
            {value.name}
          </Link>
        </h3>
        <div className="view-item-meta">
          <span className="badge badge-primary">
            {value.status}
          </span>
          <span className="badge badge-secondary">
            {value.priority}
          </span>
        </div>
      </div>
      <div className="view-item-body">
        <p>{value.description}</p>
        <div className="view-item-dates">
          {value.startDate && (
            <div>
              <strong>{i18n('entities.project.fields.startDate')}:</strong>{' '}
              {new Date(value.startDate).toLocaleDateString()}
            </div>
          )}
          {value.endDate && (
            <div>
              <strong>{i18n('entities.project.fields.endDate')}:</strong>{' '}
              {new Date(value.endDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectViewItem;

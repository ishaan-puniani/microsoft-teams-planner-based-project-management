import { Link } from 'react-router-dom';
import { i18n } from 'src/i18n';

const ProjectListItem = (props) => {
  const { value } = props;

  return (
    <div className="list-item">
      <div className="list-item-body">
        <div className="list-item-title">
          <Link to={`/project/${value.id}`}>
            {value.name}
          </Link>
        </div>
        <div className="list-item-description">
          {value.description}
        </div>
        <div className="list-item-meta">
          <span className="badge badge-primary">
            {value.status}
          </span>
          <span className="badge badge-secondary">
            {value.priority}
          </span>
          {value.startDate && (
            <span className="text-muted">
              {i18n('entities.project.fields.startDate')}: {new Date(value.startDate).toLocaleDateString()}
            </span>
          )}
          {value.endDate && (
            <span className="text-muted">
              {i18n('entities.project.fields.endDate')}: {new Date(value.endDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectListItem;

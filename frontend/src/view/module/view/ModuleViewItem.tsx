import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import selectors from 'src/modules/module/moduleSelectors';

const ModuleViewItem = (props) => {
  const hasPermissionToRead = useSelector(
    selectors.selectPermissionToRead,
  );

  const valueAsArray = () => {
    const { value } = props;

    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    return [value];
  };

  const displayableRecord = (record) => {
    if (hasPermissionToRead) {
      return (
        <div key={record.id}>
          <Link
            className="btn btn-link"
            to={`/module/${record.id}`}
          >
            {record.title}
          </Link>
        </div>
      );
    }

    return <div key={record.id}>{record.title}</div>;
  };

  if (!valueAsArray().length) {
    return null;
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <label className="col-form-label">
        {props.label}
      </label>
      {valueAsArray().map((value) =>
        displayableRecord(value),
      )}
    </div>
  );
};

ModuleViewItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
};

export default ModuleViewItem;

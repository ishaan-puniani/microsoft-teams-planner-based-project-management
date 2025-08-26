import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import auditLogSelectors from 'src/modules/auditLog/auditLogSelectors';
import userSelectors from 'src/modules/user/userSelectors';
import selectors from 'src/modules/user/view/userViewSelectors';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import Toolbar from 'src/view/shared/styles/Toolbar';

function UserViewToolbar(props) {
  const { id } = useParams();

  const user = useSelector(selectors.selectUser);
  const hasPermissionToAuditLogs = useSelector(
    auditLogSelectors.selectPermissionToRead,
  );
  const hasPermissionToEdit = useSelector(
    userSelectors.selectPermissionToEdit,
  );

  return (
    <Toolbar>
      {hasPermissionToEdit && (
        <Link to={`/user/${id}/edit`}>
          <button className="btn btn-primary" type="button">
            <ButtonIcon iconClass="fas fa-edit" />{' '}
            {i18n('common.edit')}
          </button>
        </Link>
      )}

      {hasPermissionToAuditLogs && (
        <Link to={`/audit-logs?entityId=${id}`}>
          <button className="btn btn-light" type="button">
            <ButtonIcon iconClass="fas fa-history" />{' '}
            {i18n('auditLog.menu')}
          </button>
        </Link>
      )}

      {user && user.email && hasPermissionToAuditLogs && (
        <Link
          to={`/audit-logs?createdByEmail=${encodeURIComponent(
            user.email,
          )}`}
        >
          <button className="btn btn-light" type="button">
            <ButtonIcon iconClass="far fa-eye" />{' '}
            {i18n('user.view.activity')}
          </button>
        </Link>
      )}
    </Toolbar>
  );
}

export default UserViewToolbar;

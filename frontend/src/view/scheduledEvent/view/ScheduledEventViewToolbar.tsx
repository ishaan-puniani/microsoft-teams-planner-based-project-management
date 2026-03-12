import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { i18n } from 'src/i18n';
import auditLogSelectors from 'src/modules/auditLog/auditLogSelectors';
import { AppDispatch } from 'src/modules/store';
import destroyActions from 'src/modules/scheduledEvent/destroy/scheduledEventDestroyActions';
import destroySelectors from 'src/modules/scheduledEvent/destroy/scheduledEventDestroySelectors';
import scheduledEventSelectors from 'src/modules/scheduledEvent/scheduledEventSelectors';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import ConfirmModal from 'src/view/shared/modals/ConfirmModal';
import Toolbar from 'src/view/shared/styles/Toolbar';

const ScheduledEventViewToolbar = (props) => {
  const [destroyConfirmVisible, setDestroyConfirmVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const id = props.id;

  const hasPermissionToAuditLogs = useSelector(auditLogSelectors.selectPermissionToRead);
  const hasPermissionToEdit = useSelector(scheduledEventSelectors.selectPermissionToEdit);
  const hasPermissionToDestroy = useSelector(scheduledEventSelectors.selectPermissionToDestroy);
  const destroyLoading = useSelector(destroySelectors.selectLoading);

  const doDestroy = () => {
    setDestroyConfirmVisible(false);
    dispatch(destroyActions.doDestroy(id));
  };

  return (
    <Toolbar>
      {hasPermissionToEdit && (
        <Link to={`/scheduled-event/${id}/edit`}>
          <button className="btn btn-primary" type="button">
            <ButtonIcon iconClass="fas fa-edit" />{' '}
            {i18n('common.edit')}
          </button>
        </Link>
      )}

      {hasPermissionToDestroy && (
        <button
          className="btn btn-primary"
          type="button"
          disabled={destroyLoading}
          onClick={() => setDestroyConfirmVisible(true)}
        >
          <ButtonIcon loading={destroyLoading} iconClass="fas fa-trash-alt" />{' '}
          {i18n('common.destroy')}
        </button>
      )}

      {hasPermissionToAuditLogs && (
        <Link to={`/audit-logs?entityId=${encodeURIComponent(id)}`}>
          <button className="btn btn-light" type="button">
            <ButtonIcon iconClass="fas fa-history" />{' '}
            {i18n('auditLog.menu')}
          </button>
        </Link>
      )}

      {destroyConfirmVisible && (
        <ConfirmModal
          title={i18n('common.areYouSure')}
          onConfirm={() => doDestroy()}
          onClose={() => setDestroyConfirmVisible(false)}
          okText={i18n('common.yes')}
          cancelText={i18n('common.no')}
        />
      )}
    </Toolbar>
  );
};

export default ScheduledEventViewToolbar;

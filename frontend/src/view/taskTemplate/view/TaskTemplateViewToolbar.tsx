import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { i18n } from 'src/i18n';
import auditLogSelectors from 'src/modules/auditLog/auditLogSelectors';
import destroyActions from 'src/modules/taskTemplate/destroy/taskTemplateDestroyActions';
import destroySelectors from 'src/modules/taskTemplate/destroy/taskTemplateDestroySelectors';
import taskTemplateSelectors from 'src/modules/taskTemplate/taskTemplateSelectors';
import { AppDispatch } from 'src/modules/store';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import ConfirmModal from 'src/view/shared/modals/ConfirmModal';
import Toolbar from 'src/view/shared/styles/Toolbar';

const TaskTemplateViewToolbar = (props) => {
  const [destroyConfirmVisible, setDestroyConfirmVisible] =
    useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const id = props.match?.params?.id;

  const hasPermissionToAuditLogs = useSelector(
    auditLogSelectors.selectPermissionToRead,
  );
  const hasPermissionToEdit = useSelector(
    taskTemplateSelectors.selectPermissionToEdit,
  );
  const hasPermissionToDestroy = useSelector(
    taskTemplateSelectors.selectPermissionToDestroy,
  );
  const destroyLoading = useSelector(
    destroySelectors.selectLoading,
  );

  const doOpenDestroyConfirmModal = () => {
    setDestroyConfirmVisible(true);
  };

  const doCloseDestroyConfirmModal = () => {
    setDestroyConfirmVisible(false);
  };

  const doDestroy = () => {
    doCloseDestroyConfirmModal();
    dispatch(destroyActions.doDestroy(id));
  };

  return (
    <Toolbar>
      {hasPermissionToEdit && (
        <Link to={`/task-template/${id}/edit`}>
          <ButtonIcon
            iconClass="fas fa-edit"
            tooltip={i18n('common.edit')}
          />
        </Link>
      )}

      {hasPermissionToDestroy && (
        <ButtonIcon
          iconClass="fas fa-trash"
          tooltip={i18n('common.destroy')}
          onClick={doOpenDestroyConfirmModal}
          loading={destroyLoading}
        />
      )}

      {hasPermissionToAuditLogs && (
        <Link to={`/audit-logs?entityId=${encodeURIComponent(id)}`}>
          <ButtonIcon
            iconClass="fas fa-history"
            tooltip={i18n('auditLog.menu')}
          />
        </Link>
      )}

      {destroyConfirmVisible && (
        <ConfirmModal
          title={i18n('common.areYouSure')}
          onConfirm={() => doDestroy()}
          onClose={() => doCloseDestroyConfirmModal()}
          okText={i18n('common.yes')}
          cancelText={i18n('common.no')}
        />
      )}
    </Toolbar>
  );
};

export default TaskTemplateViewToolbar;

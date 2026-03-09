import { useEffect, useRef, useState } from 'react';
import { Modal } from 'bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { i18n } from 'src/i18n';
import auditLogSelectors from 'src/modules/auditLog/auditLogSelectors';
import { AppDispatch, getHistory } from 'src/modules/store';
import destroyActions from 'src/modules/testCycle/destroy/testCycleDestroyActions';
import destroySelectors from 'src/modules/testCycle/destroy/testCycleDestroySelectors';
import testCycleSelectors from 'src/modules/testCycle/testCycleSelectors';
import TestCycleService from 'src/modules/testCycle/testCycleService';
import Message from 'src/view/shared/message';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import ConfirmModal from 'src/view/shared/modals/ConfirmModal';
import Toolbar from 'src/view/shared/styles/Toolbar';
import Errors from 'src/modules/shared/error/errors';

const TestCycleViewToolbar = (props) => {
  const [destroyConfirmVisible, setDestroyConfirmVisible] =
    useState(false);
  const [cloneModalVisible, setCloneModalVisible] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [cloneLoading, setCloneLoading] = useState(false);
  const cloneModalRef = useRef<any>(null);
  const cloneModalInstanceRef = useRef<Modal | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const id = props.id;

  const hasPermissionToAuditLogs = useSelector(
    auditLogSelectors.selectPermissionToRead,
  );
  const hasPermissionToEdit = useSelector(
    testCycleSelectors.selectPermissionToEdit,
  );
  const hasPermissionToDestroy = useSelector(
    testCycleSelectors.selectPermissionToDestroy,
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

  const doOpenCloneModal = () => {
    setCloneName('');
    setCloneModalVisible(true);
  };

  useEffect(() => {
    if (!cloneModalVisible || !cloneModalRef.current) return;
    const el = cloneModalRef.current;
    const modal = new Modal(el);
    cloneModalInstanceRef.current = modal;
    modal.show();
    const onHidden = () => {
      setCloneModalVisible(false);
      setCloneName('');
      cloneModalInstanceRef.current = null;
    };
    el.addEventListener('hidden.bs.modal', onHidden);
    return () => {
      el.removeEventListener('hidden.bs.modal', onHidden);
      try {
        modal.dispose();
      } catch {
        // ignore
      }
      cloneModalInstanceRef.current = null;
    };
  }, [cloneModalVisible]);

  const doCloseCloneModal = () => {
    if (cloneModalInstanceRef.current) {
      cloneModalInstanceRef.current.hide();
      cloneModalInstanceRef.current = null;
    }
    setCloneModalVisible(false);
    setCloneName('');
  };

  const doClone = async () => {
    const name = (cloneName || '').trim();
    if (!name) {
      Message.error(i18n('entities.testCycle.view.cloneNewNameLabel') + ' is required');
      return;
    }
    setCloneLoading(true);
    try {
      const record = await TestCycleService.find(id);
      const projectId = record.project?.id ?? record.project;
      const leadById = record.leadBy?.id ?? record.leadBy;
      const testResults = (record.testResults || []).map((tr) => ({
        task: typeof tr.task === 'object' && tr.task?.id != null ? tr.task.id : tr.task,
      }));
      const newRecord = await TestCycleService.create({
        project: projectId,
        leadBy: leadById ?? undefined,
        title: name,
        testResults,
      });
      Message.success(i18n('entities.testCycle.create.success'));
      doCloseCloneModal();
      getHistory().push(`/test-cycle/${newRecord.id}`);
    } catch (error) {
      Errors.handle(error);
    } finally {
      setCloneLoading(false);
    }
  };

  return (
    <Toolbar>
      {hasPermissionToEdit && (
        <Link to={`/test-cycle/${id}/edit`}>
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
          onClick={doOpenDestroyConfirmModal}
        >
          <ButtonIcon
            loading={destroyLoading}
            iconClass="fas fa-trash-alt"
          />{' '}
          {i18n('common.destroy')}
        </button>
      )}

      {hasPermissionToAuditLogs && (
        <Link
          to={`/audit-logs?entityId=${encodeURIComponent(
            id,
          )}`}
        >
          <button className="btn btn-light" type="button">
            <ButtonIcon iconClass="fas fa-history" />{' '}
            {i18n('auditLog.menu')}
          </button>
        </Link>
      )}

      {hasPermissionToEdit && (
        <button
          className="btn btn-primary"
          type="button"
          disabled={cloneLoading}
          onClick={doOpenCloneModal}
        >
          <ButtonIcon
            loading={cloneLoading}
            iconClass="fas fa-copy"
          />{' '}
          {i18n('common.clone')}
        </button>
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

      {cloneModalVisible && (
        <div
          ref={cloneModalRef}
          className="modal"
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {i18n('entities.testCycle.view.cloneTitle')}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={doCloseCloneModal}
                />
              </div>
              <div className="modal-body">
                <label className="form-label">
                  {i18n('entities.testCycle.view.cloneNewNameLabel')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder={i18n('entities.testCycle.view.cloneNewNameLabel')}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), doClone())}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={doCloseCloneModal}
                >
                  {i18n('common.cancel')}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={cloneLoading}
                  onClick={doClone}
                >
                  {cloneLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" />
                      {i18n('common.loading')}
                    </>
                  ) : (
                    i18n('common.clone')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Toolbar>
  );
};

export default TestCycleViewToolbar;

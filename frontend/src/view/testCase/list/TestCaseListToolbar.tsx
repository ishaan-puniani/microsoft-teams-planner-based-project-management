import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { i18n } from 'src/i18n';
import auditLogSelectors from 'src/modules/auditLog/auditLogSelectors';
import { AppDispatch } from 'src/modules/store';
import destroyActions from 'src/modules/testCase/destroy/testCaseDestroyActions';
import destroySelectors from 'src/modules/testCase/destroy/testCaseDestroySelectors';
import actions from 'src/modules/testCase/list/testCaseListActions';
import selectors from 'src/modules/testCase/list/testCaseListSelectors';
import testCaseSelectors from 'src/modules/testCase/testCaseSelectors';
import testCycleSelectors from 'src/modules/testCycle/testCycleSelectors';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import AssignToTestCycleModal from 'src/view/testCase/list/AssignToTestCycleModal';
import ConfirmModal from 'src/view/shared/modals/ConfirmModal';
import Toolbar from 'src/view/shared/styles/Toolbar';

const TestCaseToolbar = (props) => {
  const [
    destroyAllConfirmVisible,
    setDestroyAllConfirmVisible,
  ] = useState(false);
  const [
    assignToTestCycleModalVisible,
    setAssignToTestCycleModalVisible,
  ] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const selectedKeys = useSelector(
    selectors.selectSelectedKeys,
  );
  const loading = useSelector(selectors.selectLoading);
  const destroyLoading = useSelector(
    destroySelectors.selectLoading,
  );
  const exportLoading = useSelector(
    selectors.selectExportLoading,
  );
  const hasRows = useSelector(selectors.selectHasRows);
  const hasPermissionToAuditLogs = useSelector(
    auditLogSelectors.selectPermissionToRead,
  );
  const hasPermissionToDestroy = useSelector(
    testCaseSelectors.selectPermissionToDestroy,
  );
  const hasPermissionToCreate = useSelector(
    testCaseSelectors.selectPermissionToCreate,
  );
  const hasPermissionToImport = useSelector(
    testCaseSelectors.selectPermissionToImport,
  );
  const hasPermissionToEditTestCycle = useSelector(
    testCycleSelectors.selectPermissionToEdit,
  );

  const doOpenDestroyAllConfirmModal = () => {
    setDestroyAllConfirmVisible(true);
  };

  const doCloseDestroyAllConfirmModal = () => {
    setDestroyAllConfirmVisible(false);
  };

  const doExport = () => {
    dispatch(actions.doExport());
  };

  const doDestroyAllSelected = () => {
    doCloseDestroyAllConfirmModal();

    dispatch(destroyActions.doDestroyAll(selectedKeys));
  };

  const doOpenAssignToTestCycleModal = () => {
    setAssignToTestCycleModalVisible(true);
  };

  const doCloseAssignToTestCycleModal = () => {
    setAssignToTestCycleModalVisible(false);
  };

  const doAssignToTestCycleSuccess = () => {
    doCloseAssignToTestCycleModal();
    dispatch(actions.doClearAllSelected());
    dispatch(actions.doFetchCurrentFilter());
  };

  const renderExportButton = () => {
    const disabled = !hasRows || loading;

    const button = (
      <button
        className="btn btn-light"
        disabled={disabled}
        onClick={doExport}
        type="button"
      >
        <ButtonIcon
          loading={exportLoading}
          iconClass="far fa-file-excel"
        />{' '}
        {i18n('common.export')}
      </button>
    );

    if (disabled) {
      return (
        <span
          data-tip={i18n('common.noDataToExport')}
          data-tip-disable={!disabled}
          data-for="testCase-list-toolbar-export-tooltip"
        >
          {button}
          <Tooltip id="testCase-list-toolbar-export-tooltip" />
        </span>
      );
    }

    return button;
  };

  const renderDestroyButton = () => {
    if (!hasPermissionToDestroy) {
      return null;
    }

    const disabled = !selectedKeys.length || loading;

    const button = (
      <button
        disabled={disabled}
        className="btn btn-primary"
        type="button"
        onClick={doOpenDestroyAllConfirmModal}
      >
        <ButtonIcon
          loading={destroyLoading}
          iconClass="far fa-trash-alt"
        />{' '}
        {i18n('common.destroy')}
      </button>
    );

    if (disabled) {
      return (
        <span
          data-tip={i18n('common.mustSelectARow')}
          data-tip-disable={!disabled}
          data-for="testCase-list-toolbar-destroy-tooltip"
        >
          {button}
          <Tooltip id="testCase-list-toolbar-destroy-tooltip" />
        </span>
      );
    }

    return button;
  };

  return (
    <Toolbar>
      {hasPermissionToCreate && (
        <Link to="/task/new?type=TEST_CASE">
          <button className="btn btn-primary" type="button">
            <ButtonIcon iconClass="fas fa-plus" />{' '}
            {i18n('common.new')}
          </button>
        </Link>
      )}

      {hasPermissionToImport && (
        <Link to="/task/importer">
          <button className="btn btn-primary" type="button">
            <ButtonIcon iconClass="fas fa-upload" />{' '}
            {i18n('common.import')}
          </button>
        </Link>
      )}

      {renderDestroyButton()}
      
      {hasPermissionToAuditLogs && (
        <Link to="/audit-logs?entityNames=testCase">
          <button className="btn btn-light" type="button">
            <ButtonIcon iconClass="fas fa-history" />{' '}
            {i18n('auditLog.menu')}
          </button>
        </Link>
      )}

      {renderExportButton()}

      {hasPermissionToEditTestCycle && (
        <>
          {!selectedKeys.length || loading ? (
            <span
              data-tip={i18n('common.mustSelectARow')}
              data-tip-disable={Boolean(selectedKeys.length)}
              data-for="testCase-list-toolbar-assign-tooltip"
            >
              <button
                className="btn btn-primary"
                type="button"
                disabled={!selectedKeys.length || loading}
                onClick={doOpenAssignToTestCycleModal}
              >
                <ButtonIcon iconClass="fas fa-sync" />{' '}
                {i18n(
                  'entities.testCase.assignToTestCycle.title',
                )}
              </button>
              <Tooltip id="testCase-list-toolbar-assign-tooltip" />
            </span>
          ) : (
            <button
              className="btn btn-primary"
              type="button"
              onClick={doOpenAssignToTestCycleModal}
            >
              <ButtonIcon iconClass="fas fa-sync" />{' '}
              {i18n(
                'entities.testCase.assignToTestCycle.title',
              )}
            </button>
          )}
        </>
      )}

      {destroyAllConfirmVisible && (
        <ConfirmModal
          title={i18n('common.areYouSure')}
          onConfirm={() => doDestroyAllSelected()}
          onClose={() => doCloseDestroyAllConfirmModal()}
          okText={i18n('common.yes')}
          cancelText={i18n('common.no')}
        />
      )}

      {assignToTestCycleModalVisible && (
        <AssignToTestCycleModal
          testCaseIds={selectedKeys}
          onSuccess={doAssignToTestCycleSuccess}
          onClose={doCloseAssignToTestCycleModal}
        />
      )}
    </Toolbar>
  );
};

export default TestCaseToolbar;

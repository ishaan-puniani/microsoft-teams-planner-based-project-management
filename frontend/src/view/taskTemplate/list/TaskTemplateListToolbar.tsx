import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { i18n } from 'src/i18n';
import destroyActions from 'src/modules/taskTemplate/destroy/taskTemplateDestroyActions';
import destroySelectors from 'src/modules/taskTemplate/destroy/taskTemplateDestroySelectors';
import actions from 'src/modules/taskTemplate/list/taskTemplateListActions';
import selectors from 'src/modules/taskTemplate/list/taskTemplateListSelectors';
import taskTemplateSelectors from 'src/modules/taskTemplate/taskTemplateSelectors';
import { AppDispatch } from 'src/modules/store';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import ConfirmModal from 'src/view/shared/modals/ConfirmModal';
import Toolbar from 'src/view/shared/styles/Toolbar';

const TaskTemplateListToolbar = (props) => {
  const [
    destroyAllConfirmVisible,
    setDestroyAllConfirmVisible,
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
  const hasPermissionToDestroy = useSelector(
    taskTemplateSelectors.selectPermissionToDestroy,
  );
  const hasPermissionToCreate = useSelector(
    taskTemplateSelectors.selectPermissionToCreate,
  );
  const hasPermissionToImport = useSelector(
    taskTemplateSelectors.selectPermissionToImport,
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
          data-for="tasktemplate-list-toolbar-export-tooltip"
        >
          {button}
          <Tooltip id="tasktemplate-list-toolbar-export-tooltip" />
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

    return (
      <ButtonIcon
        tooltip={i18n('common.destroy')}
        icon="fa-trash"
        disabled={disabled}
        onClick={doOpenDestroyAllConfirmModal}
        loading={destroyLoading}
      />
    );
  };

  return (
    <Toolbar>
      {hasPermissionToCreate && (
        <Link to="/task-template/new">
          <button className="btn btn-primary" type="button">
            <ButtonIcon iconClass="fas fa-plus" />{' '}
            {i18n('common.new')}
          </button>
        </Link>
      )}

      {hasPermissionToImport && (
        <Link to="/task-template/importer">
          <button className="btn btn-primary" type="button">
            <ButtonIcon iconClass="fas fa-upload" />{' '}
            {i18n('common.import')}
          </button>
        </Link>
      )}

      {renderExportButton()}
      {renderDestroyButton()}

      {destroyAllConfirmVisible && (
        <ConfirmModal
          title={i18n('common.areYouSure')}
          onConfirm={() => doDestroyAllSelected()}
          onClose={() => doCloseDestroyAllConfirmModal()}
          okText={i18n('common.yes')}
          cancelText={i18n('common.no')}
        />
      )}
    </Toolbar>
  );
};

export default TaskTemplateListToolbar;

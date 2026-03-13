import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { i18n } from 'src/i18n';
import auditLogSelectors from 'src/modules/auditLog/auditLogSelectors';
import destroyActions from 'src/modules/project/destroy/projectDestroyActions';
import destroySelectors from 'src/modules/project/destroy/projectDestroySelectors';
import projectSelectors from 'src/modules/project/projectSelectors';
import AiAgentService from 'src/modules/aiAgent/aiAgentService';
import ProjectService from 'src/modules/project/projectService';
import { AppDispatch } from 'src/modules/store';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import ConfirmModal from 'src/view/shared/modals/ConfirmModal';
import Message from 'src/view/shared/message';
import Toolbar from 'src/view/shared/styles/Toolbar';

const ProjectViewToolbar = (props) => {
  const [destroyConfirmVisible, setDestroyConfirmVisible] =
    useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [organizeLoading, setOrganizeLoading] = useState(false);
  const [estimateLoading, setEstimateLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const id = props.id;

  const hasPermissionToAuditLogs = useSelector(
    auditLogSelectors.selectPermissionToRead,
  );
  const hasPermissionToEdit = useSelector(
    projectSelectors.selectPermissionToEdit,
  );
  const hasPermissionToDestroy = useSelector(
    projectSelectors.selectPermissionToDestroy,
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

  const doSyncFromMsPlanner = async () => {
    try {
      setSyncLoading(true);
      const data = await ProjectService.syncTasksFromMsPlanner(id);
      const { synced = 0, totalFromPlanner = 0 } = data;
      Message.success(
        `Synced ${synced} task(s) from MS Planner (${totalFromPlanner} in plan).`,
      );
    } catch (e) {
      Message.error((e as Error)?.message ?? i18n('errors.default'));
    } finally {
      setSyncLoading(false);
    }
  };

  const doOrganizeTasks = async () => {
    try {
      setOrganizeLoading(true);
      const data = await AiAgentService.organizeProjectTasks(id);
      Message.success(data.message ?? `Organized: ${data.updated} linked, ${data.skipped} skipped.`);
    } catch (e) {
      Message.error((e as Error)?.message ?? i18n('errors.default'));
    } finally {
      setOrganizeLoading(false);
    }
  };

  const doSuggestEstimations = async () => {
    try {
      setEstimateLoading(true);
      const data = await AiAgentService.suggestEstimationsForProject(id);
      Message.success(`Estimated ${data.processed} Epic(s)/User Story(ies) successfully.`);
    } catch (e) {
      Message.error((e as Error)?.message ?? i18n('errors.default'));
    } finally {
      setEstimateLoading(false);
    }
  };

  return (
    <Toolbar>
      <button
        className="btn btn-primary"
        type="button"
        disabled={estimateLoading}
        onClick={doSuggestEstimations}
      >
        <ButtonIcon
          loading={estimateLoading}
          iconClass="fas fa-chart-line"
        />{' '}
        Suggest Estimations for Epics and User Stories
      </button>
      {hasPermissionToEdit && (
        <Link to={`/project/${id}/edit`}>
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

      <button
        className="btn btn-primary"
        type="button"
        disabled={syncLoading}
        onClick={doSyncFromMsPlanner}
      >
        <ButtonIcon
          loading={syncLoading}
          iconClass="fas fa-sync-alt"
        />{' '}
        Sync with MS Planner
      </button>

      <button
        className="btn btn-primary"
        type="button"
        disabled={organizeLoading}
        onClick={doOrganizeTasks}
      >
        <ButtonIcon
          loading={organizeLoading}
          iconClass="fas fa-magic"
        />{' '}
        AI Agent Organize Tasks
      </button>

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

export default ProjectViewToolbar;

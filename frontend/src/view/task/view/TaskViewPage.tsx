import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { i18n } from 'src/i18n';
import { AppDispatch } from 'src/modules/store';
import actions from 'src/modules/task/view/taskViewActions';
import selectors from 'src/modules/task/view/taskViewSelectors';
import TaskService from 'src/modules/task/taskService';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import TaskView from 'src/view/task/view/TaskView';
import TaskViewToolbar from 'src/view/task/view/TaskViewToolbar';
import TaskPlannerSyncModal, {
  type PlannerSyncFieldId,
} from 'src/view/task/view/TaskPlannerSyncModal';
import Message from 'src/view/shared/message';
import SubtaskExcelView from 'src/view/task/SubtaskExcelView';
import TestCaseExcelOfTask from 'src/view/testCase/excel/TestCaseExcelOfTask';

const TaskPage = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();

  const loading = useSelector(selectors.selectLoading);
  const record = useSelector(selectors.selectRecord);

  const [plannerModal, setPlannerModal] = useState<'sync' | 'send' | null>(null);
  const [plannerActionLoading, setPlannerActionLoading] = useState(false);

  useEffect(() => {
    dispatch(actions.doFind(id));
  }, [dispatch, id]);

  const refreshTask = () => {
    if (id) dispatch(actions.doFind(id));
  };

  const handleSyncFromPlanner = async (options: {
    fields: PlannerSyncFieldId[];
    planId?: string;
    bucketId?: string;
  }) => {
    try {
      await TaskService.syncFromPlanner(id, options.fields);
      Message.success(i18n('common.savedSuccessfully'));
      setPlannerModal(null);
      refreshTask();
    } catch (e) {
      Message.error((e as Error)?.message || i18n('errors.default'));
    } finally {
      setPlannerActionLoading(false);
    }
  };

  const handleSendToPlanner = async (options: {
    fields: PlannerSyncFieldId[];
    planId?: string;
    bucketId?: string;
  }) => {
    if (!id) return;
    setPlannerActionLoading(true);
    try {
      await TaskService.sendToPlanner(id, {
        fields: options.fields,
        ...(options.planId && { planId: options.planId }),
        ...(options.bucketId && { bucketId: options.bucketId }),
      });
      Message.success(i18n('common.savedSuccessfully'));
      setPlannerModal(null);
      refreshTask();
    } catch (e) {
      Message.error((e as Error)?.message || i18n('errors.default'));
    } finally {
      setPlannerActionLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          [i18n('dashboard.menu'), '/'],
          [i18n('entities.task.menu'), '/task'],
          [i18n('entities.task.view.title')],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {i18n('entities.task.view.title')}
        </PageTitle>

        <TaskViewToolbar id={id} />
        <div className="d-flex align-items-center gap-2 mb-3">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setPlannerModal('sync')}
            disabled={!record}
            title="Pull selected fields from the linked Microsoft Planner task"
          >
            Update from Planner
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPlannerModal('send')}
            disabled={!record}
            title="Push selected fields to Microsoft Planner (create or update)"
          >
            Send to Planner
          </button>
        </div>
        <TaskView loading={loading} record={record} />

        <SubtaskExcelView
          taskId={id}
          projectId={record?.project?.id ?? record?.project}
          type={
            record?.type === 'EPIC'
              ? 'USER_STORY'
              : record?.type === 'USER_STORY'
                ? 'TASK'
                : record?.type === 'TEST_CASE'
                  ? 'BUG'
                  : 'TEST_CASE'
          }
          templateId={
            record?.type === 'EPIC'
              ? record?.project?.userStoryTemplate?.id ?? record?.project?.userStoryTemplate
              : record?.type === 'USER_STORY'
                ? record?.project?.taskTemplate?.id ?? record?.project?.taskTemplate
                : record?.type === 'TEST_CASE'
                  ? record?.project?.bugTemplate?.id ?? record?.project?.bugTemplate
                  : record?.project?.testCaseTemplate?.id ?? record?.project?.testCaseTemplate
          }
          taskTitle={record?.title}
          taskDescription={record?.description}
        />

        <hr />
        
        <TestCaseExcelOfTask
          taskId={id}
          projectId={record?.project?.id ?? record?.project}
          testCaseTemplateId={
            record?.project?.testCaseTemplate?.id ?? record?.project?.testCaseTemplate
          }
          taskTitle={record?.title}
          taskDescription={record?.description}
        />
      </ContentWrapper>

      {plannerModal === 'sync' && (
        <TaskPlannerSyncModal
          show
          onClose={() => setPlannerModal(null)}
          mode="sync"
          taskRecord={record}
          onConfirm={handleSyncFromPlanner}
          loading={plannerActionLoading}
        />
      )}
      {plannerModal === 'send' && (
        <TaskPlannerSyncModal
          show
          onClose={() => setPlannerModal(null)}
          mode="send"
          taskRecord={record}
          onConfirm={handleSendToPlanner}
          loading={plannerActionLoading}
        />
      )}
    </>
  );
};

export default TaskPage;

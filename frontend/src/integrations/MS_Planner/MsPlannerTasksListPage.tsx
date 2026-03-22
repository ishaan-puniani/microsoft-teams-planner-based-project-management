import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import MsPlannerTaskListItem, {
  type PlannerTask,
} from './components/MsPlannerTaskListItem';
import MoveMsPlannerTasksDialog from './components/MoveMsPlannerTasksDialog';
import CreateMsPlannerTaskWithDetail from './components/CreateMsPlannerTaskWithDetail';
import QuickCreateMsPlannerTaskWithDetail from './components/QuickCreateMsPlannerTaskWithDetail';
import MsPlannerFilter, {
  type MsPlannerFilters,
  EMPTY_FILTERS,
} from './components/MsPlannerFilter';

export interface PlanCategories {
  [key: string]: string;
}

const MsPlannerTasksListPage = () => {
  const { planId } = useParams();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [planTitle, setPlanTitle] = useState<string | null>(null);
  const [categories, setCategories] = useState<PlanCategories>({});
  const [buckets, setBuckets] = useState<Array<{ id: string; name?: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; displayName?: string | null; mail?: string | null; userPrincipalName?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [quickCreateVisible, setQuickCreateVisible] = useState(false);
  type LayoutMode = 'list' | 'grid2' | 'grid3';
  const [layout, setLayout] = useState<LayoutMode>('grid3');
  const [filters, setFilters] = useState<MsPlannerFilters>(EMPTY_FILTERS);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkMoveVisible, setBulkMoveVisible] = useState(false);

  const fetchFilteredTasks = useCallback(
    async (currentFilters: MsPlannerFilters) => {
      if (!planId) return;
      setTasksLoading(true);
      try {
        const tasksData = await MsPlannerService.getTasks(planId, currentFilters);
        setTasks(tasksData || []);
      } catch (e: any) {
        console.error('Failed to filter tasks:', e?.message);
      } finally {
        setTasksLoading(false);
      }
    },
    [planId],
  );

  const handleFilterChange = (newFilters: MsPlannerFilters) => {
    setFilters(newFilters);
    fetchFilteredTasks(newFilters);
  };

  useEffect(() => {
    if (!planId) return;
    const doFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const [tasksData, planData, usersData] = await Promise.all([
          MsPlannerService.getTasks(planId),
          MsPlannerService.getPlan(planId).catch(() => null),
          MsPlannerService.getUsers().catch(() => []),
        ]);
        setTasks(tasksData || []);
        setPlanTitle(planData?.title ?? planData?.name ?? null);
        setCategories(planData?.categories || {});
        setBuckets(Array.isArray(planData?.buckets) ? planData.buckets : []);
        setUsers(usersData || []);
        setSelectedTasks([]);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || e?.message || 'Failed to load tasks',
        );
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [planId]);

  const handleTaskUpdate = (updated: PlannerTask) => {
    if (!updated.id) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
    );
  };

  const handleTaskMove = (result: {
    sourceTaskId: string;
    destinationTask: PlannerTask;
    sourceDeleted: boolean;
    destinationPlanId: string;
    destinationBucketId: string;
  }) => {
    const destinationTask = result.destinationTask;
    const movedWithinCurrentPlan = !!planId && result.destinationPlanId === planId;

    setTasks((prev) => {
      const withoutSource = prev.filter((t) => t.id !== result.sourceTaskId);
      if (!movedWithinCurrentPlan || !destinationTask?.id) {
        return withoutSource;
      }
      return [destinationTask, ...withoutSource];
    });
  };

  const handleTaskSelectionChange = (taskId: string, selected: boolean) => {
    setSelectedTasks((prev) => {
      if (selected) {
        if (prev.includes(taskId)) return prev;
        return [...prev, taskId];
      }
      return prev.filter((id) => id !== taskId);
    });
  };

  const handleBulkMoveSuccess = (payload: any) => {
    const results = Array.isArray(payload?.results) ? payload.results : [];
    const movedMap = new Map<string, PlannerTask>();
    const removed = new Set<string>();

    results.forEach((item: any) => {
      if (!item) return;
      if (item.sourceTaskId) {
        removed.add(item.sourceTaskId);
      } else if (item.taskId) {
        removed.add(item.taskId);
      }
      if (item.destinationTask?.id && item.destinationPlanId === planId) {
        movedMap.set(item.destinationTask.id, item.destinationTask);
      }
    });

    setTasks((prev) => {
      const kept = prev.filter((t) => !removed.has(String(t.id || '')));
      return [...Array.from(movedMap.values()), ...kept];
    });
    setSelectedTasks([]);
    setBulkMoveVisible(false);
  };

  const hasActiveFilters =
    filters.buckets.length > 0 ||
    filters.statuses.length > 0 ||
    filters.categories.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assignedTos.length > 0 ||
    !!filters.startDateFrom ||
    !!filters.startDateTo;

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <>
        <Breadcrumb
          items={[
            ['Dashboard', '/'],
            ['MS Planner', '/msplanner/plan/' + planId],
            ['Tasks'],
          ]}
        />
        <ContentWrapper>
          <PageTitle>MS Planner – Tasks</PageTitle>
          <div className="text-danger">{error}</div>
        </ContentWrapper>
      </>
    );
  }

  const breadcrumbTitle = planTitle || 'Plan';

  return (
    <>
      <Breadcrumb
        items={[
          ['Dashboard', '/'],
          ['MS Planner', '/msplanner/plan/' + planId],
          [breadcrumbTitle, `/msplanner/plan/${planId}`],
          ['Tasks'],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {planTitle ? `${planTitle} – Tasks` : 'MS Planner Tasks'}
          <Link
            className="btn btn-sm btn-secondary ms-2"
            to={`/msplanner/plan/${planId}`}
          >
            Back to plan
          </Link>
          <Link
            className="btn btn-sm btn-outline-primary ms-2"
            to={`/msplanner/board/${planId}`}
          >
            Board view
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-primary ml-2"
            onClick={() => setCreateVisible(true)}
          >
            Add Task
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary ml-2"
            onClick={() => setQuickCreateVisible(true)}
          >
            Quick mode Add Tasks
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-warning ml-2"
            disabled={selectedTasks.length === 0}
            onClick={() => setBulkMoveVisible(true)}
          >
            Move tasks ({selectedTasks.length})
          </button>
        </PageTitle>
        <MsPlannerFilter
          buckets={buckets}
          categories={categories}
          users={users}
          onFilterChange={handleFilterChange}
        />
        <CreateMsPlannerTaskWithDetail
          planId={planId ?? null}
          visible={createVisible}
          onClose={() => setCreateVisible(false)}
          onSuccess={(task) => {
            if (task?.id) {
              setTasks((prev) => [task, ...prev]);
            }
            setCreateVisible(false);
          }}
          categories={categories}
          users={users}
        />

        <QuickCreateMsPlannerTaskWithDetail
          planId={planId ?? null}
          visible={quickCreateVisible}
          onClose={() => setQuickCreateVisible(false)}
          onSuccess={(createdTasks) => {
            if (Array.isArray(createdTasks) && createdTasks.length) {
              setTasks((prev) => [...createdTasks, ...prev]);
            } else if (createdTasks?.id) {
              setTasks((prev) => [createdTasks, ...prev]);
            }
            setQuickCreateVisible(false);
          }}
          categories={categories}
          users={users}
        />
        <MoveMsPlannerTasksDialog
          taskIds={selectedTasks}
          currentPlanId={planId}
          visible={bulkMoveVisible}
          onClose={() => setBulkMoveVisible(false)}
          onSuccess={handleBulkMoveSuccess}
        />
        <div className="d-flex align-items-center gap-1 mb-3">
          <span className="text-muted small me-2">Layout:</span>
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn btn-outline-secondary ${layout === 'list' ? 'active' : ''}`}
              onClick={() => setLayout('list')}
              title="List view"
            >
              <i className="fas fa-list" />
            </button>
            <button
              type="button"
              className={`btn btn-outline-secondary ${layout === 'grid2' ? 'active' : ''}`}
              onClick={() => setLayout('grid2')}
              title="2 columns"
            >
              <i className="fas fa-th-large" />
            </button>
            <button
              type="button"
              className={`btn btn-outline-secondary ${layout === 'grid3' ? 'active' : ''}`}
              onClick={() => setLayout('grid3')}
              title="3 columns"
            >
              <i className="fas fa-th" />
            </button>
          </div>
        </div>
        {tasksLoading ? (
          <div className="d-flex justify-content-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Filtering…</span>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-muted py-5">
            {hasActiveFilters
              ? 'No tasks match the current filters.'
              : 'No tasks in this plan.'}
          </div>
        ) : (
          <div
            className={`row g-3 ${
              layout === 'list'
                ? 'row-cols-1'
                : layout === 'grid2'
                  ? 'row-cols-1 row-cols-md-2'
                  : 'row-cols-1 row-cols-md-2 row-cols-lg-3'
            }`}
          >
            {tasks.map((task) => (
              <div key={task.id} className="col">
                <MsPlannerTaskListItem
                  task={task}
                  planId={planId}
                  categories={categories}
                  buckets={buckets}
                  users={users}
                  onTaskUpdate={handleTaskUpdate}
                  isSelected={selectedTasks.includes(String(task.id || ''))}
                  onSelectionChange={handleTaskSelectionChange}
                  onTaskMove={handleTaskMove}
                />
              </div>
            ))}
          </div>
        )}
      </ContentWrapper>
    </>
  );
};

export default MsPlannerTasksListPage;

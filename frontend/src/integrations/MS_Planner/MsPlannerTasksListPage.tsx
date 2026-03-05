import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import MsPlannerTaskListItem, {
  type PlannerTask,
} from './components/MsPlannerTaskListItem';
import CreateMsPlannerTaskWithDetail from './components/CreateMsPlannerTaskWithDetail';
import QuickCreateMsPlannerTaskWithDetail from './components/QuickCreateMsPlannerTaskWithDetail';

export interface PlanCategories {
  [key: string]: string;
}

const MsPlannerTasksListPage = () => {
  const { planId } = useParams();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [planTitle, setPlanTitle] = useState<string | null>(null);
  const [categories, setCategories] = useState<PlanCategories>({});
  const [users, setUsers] = useState<Array<{ id: string; displayName?: string | null; mail?: string | null; userPrincipalName?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [quickCreateVisible, setQuickCreateVisible] = useState(false);

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
        setUsers(usersData || []);
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
            className="btn btn-sm btn-secondary ml-2"
            to={`/msplanner/plan/${planId}`}
          >
            Back to plan
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
        </PageTitle>

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

        {tasks.length === 0 ? (
          <div className="text-center text-muted py-5">
            No tasks in this plan.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3">
            {tasks.map((task) => (
              <div key={task.id} className="col">
                <MsPlannerTaskListItem
                  task={task}
                  categories={categories}
                  users={users}
                  onTaskUpdate={handleTaskUpdate}
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

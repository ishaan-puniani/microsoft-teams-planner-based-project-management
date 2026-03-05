import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import TableWrapper from 'src/view/shared/styles/TableWrapper';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';

const formatDate = (value: string | undefined | null): string => {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString();
  } catch {
    return String(value);
  }
};

interface PlannerTask {
  id: string;
  title?: string;
  dueDateTime?: string;
  percentComplete?: number;
  createdDateTime?: string;
}

const MsPlannerTasksListPage = () => {
  const { planId } = useParams();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [planTitle, setPlanTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) return;
    const doFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const [tasksData, planData] = await Promise.all([
          MsPlannerService.getTasks(planId),
          MsPlannerService.getPlan(planId).catch(() => null),
        ]);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setPlanTitle(planData?.title ?? planData?.name ?? null);
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
        </PageTitle>

        <TableWrapper>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Due date</th>
                <th>Percent complete</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No tasks in this plan.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title ?? '—'}</td>
                    <td>{formatDate(task.dueDateTime)}</td>
                    <td>{task.percentComplete ?? 0}%</td>
                    <td>{formatDate(task.createdDateTime)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
      </ContentWrapper>
    </>
  );
};

export default MsPlannerTasksListPage;

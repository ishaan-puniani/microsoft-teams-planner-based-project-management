import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Board from 'react-trello';
import ContentWrapper from 'src/view/layout/styles/ContentWrapper';
import Breadcrumb from 'src/view/shared/Breadcrumb';
import PageTitle from 'src/view/shared/styles/PageTitle';
import Spinner from 'src/view/shared/Spinner';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import MsPlannerTaskDetail from './components/MsPlannerTaskDetail';
import type { PlannerTask } from './components/MsPlannerTaskListItem';
import moment from 'moment';

interface Bucket {
  id: string;
  name?: string;
  orderHint?: string;
}

interface TrelloCard {
  id: string;
  title: string;
  description?: string;
  label?: string;
  metadata?: PlannerTask;
}

interface TrelloLane {
  id: string;
  title: string;
  label?: string;
  cards: TrelloCard[];
}

interface BoardData {
  lanes: TrelloLane[];
}

function formatDue(value: string | null | undefined): string {
  if (!value) return '';
  const m = moment(value);
  return m.isValid() ? m.format('MMM D, YYYY') : '';
}

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Urgent',
  5: 'Important',
  9: 'Medium',
  10: 'Low',
};

function sortByOrderHint<T extends { orderHint?: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const ha = a.orderHint ?? '';
    const hb = b.orderHint ?? '';
    return ha < hb ? -1 : ha > hb ? 1 : 0;
  });
}

function sortBucketsByOrderHint(buckets: Bucket[]): Bucket[] {
  return [...buckets].sort((a, b) => {
    const ha = a.orderHint ?? '';
    const hb = b.orderHint ?? '';
    return ha > hb ? -1 : ha < hb ? 1 : 0;
  });
}

function buildBoardData(
  buckets: Bucket[],
  tasks: PlannerTask[],
): BoardData {
  const sortedBuckets = sortBucketsByOrderHint(buckets);
  const lanes: TrelloLane[] = sortedBuckets.map((bucket) => {
    const laneTasks = sortByOrderHint(
      tasks.filter((t) => t.bucketId === bucket.id),
    );
    const cards: TrelloCard[] = laneTasks.map((task) => {
      const priorityLabel =
        task.priority != null && PRIORITY_LABELS[task.priority]
          ? PRIORITY_LABELS[task.priority]
          : null;
      const dueLabel = formatDue(task.dueDateTime);
      const label = [priorityLabel, dueLabel].filter(Boolean).join(' · ') || undefined;
      return {
        id: task.id!,
        title: task.title || 'Untitled',
        description: dueLabel ? `Due ${dueLabel}` : undefined,
        label,
        metadata: task,
      };
    });
    return {
      id: bucket.id,
      title: bucket.name || 'Bucket',
      label: `${cards.length}`,
      cards,
    };
  });

  const unassignedTasks = sortByOrderHint(tasks.filter((t) => !t.bucketId));
  if (unassignedTasks.length > 0 && buckets.length > 0) {
    const unassignedCards: TrelloCard[] = unassignedTasks.map((task) => {
      const priorityLabel =
        task.priority != null && PRIORITY_LABELS[task.priority]
          ? PRIORITY_LABELS[task.priority]
          : null;
      const dueLabel = formatDue(task.dueDateTime);
      const label = [priorityLabel, dueLabel].filter(Boolean).join(' · ') || undefined;
      return {
        id: task.id!,
        title: task.title || 'Untitled',
        description: dueLabel ? `Due ${dueLabel}` : undefined,
        label,
        metadata: task,
      };
    });
    lanes.unshift({
      id: '__unassigned__',
      title: 'Unassigned',
      label: `${unassignedCards.length}`,
      cards: unassignedCards,
    });
  }

  return { lanes };
}

const MSPlannerBoardPage = () => {
  const { planId } = useParams();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [planTitle, setPlanTitle] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingCardId, setMovingCardId] = useState<string | null>(null);
  const [taskDetailId, setTaskDetailId] = useState<string | null>(null);
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);

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
        setTasks(tasksData || []);
        setPlanTitle(planData?.title ?? planData?.name ?? null);
        setBuckets(Array.isArray(planData?.buckets) ? planData.buckets : []);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || e?.message || 'Failed to load board',
        );
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [planId]);

  const boardData = useMemo(
    () => buildBoardData(buckets, tasks),
    [buckets, tasks],
  );

  const handleCardMoveAcrossLanes = async (
    fromLaneId: string,
    toLaneId: string,
    cardId: string,
  ) => {
    if (toLaneId === '__unassigned__') return;
    const task = tasks.find((t) => t.id === cardId);
    const etag = task?.['@odata.etag'];
    if (!etag) {
      setError('Cannot move task: missing version (etag). Refresh the board and try again.');
      return;
    }
    setMovingCardId(cardId);
    try {
      await MsPlannerService.updateTask(cardId, { etag, bucketId: toLaneId });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === cardId ? { ...t, bucketId: toLaneId } : t,
        ),
      );
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || 'Failed to move task',
      );
    } finally {
      setMovingCardId(null);
    }
  };

  const handleDataChange = async (newData: BoardData) => {
    if (!planId) return;
    for (const newLane of newData.lanes) {
      if (newLane.id === '__unassigned__') continue;
      const currentLane = boardData.lanes.find((l) => l.id === newLane.id);
      if (!currentLane) continue;
      const oldIds = currentLane.cards.map((c) => c.id);
      const newIds = newLane.cards.map((c) => c.id);
      const sameSet =
        oldIds.length === newIds.length &&
        oldIds.every((id) => newIds.includes(id));
      if (!sameSet) continue;
      const orderChanged =
        oldIds.length !== newIds.length || oldIds.some((id, i) => id !== newIds[i]);
      if (!orderChanged) continue;

      const movedCardId = newIds.find((id, i) => oldIds.indexOf(id) !== i);
      if (!movedCardId) continue;

      const newIndex = newIds.indexOf(movedCardId);
      const prevTaskId = newIndex > 0 ? newIds[newIndex - 1] : undefined;
      const nextTaskId = newIndex < newIds.length - 1 ? newIds[newIndex + 1] : undefined;
      const prevTask = prevTaskId ? tasks.find((t) => t.id === prevTaskId) : undefined;
      const nextTask = nextTaskId ? tasks.find((t) => t.id === nextTaskId) : undefined;
      const newOrderHint = `${prevTask?.orderHint ?? ''} ${nextTask?.orderHint ?? ''}!`;

      const task = tasks.find((t) => t.id === movedCardId);
      const etag = task?.['@odata.etag'];
      if (!etag) {
        setError('Cannot reorder: missing version (etag). Refresh and try again.');
        return;
      }

      setMovingCardId(movedCardId);
      try {
        await MsPlannerService.updateTask(movedCardId, { etag, orderHint: newOrderHint });
        setError(null);
        const updated = await MsPlannerService.getTasks(planId);
        setTasks(updated || []);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || e?.message || 'Failed to reorder task',
        );
      } finally {
        setMovingCardId(null);
      }
      return;
    }
  };

  const handleCardClick = (cardId: string) => {
    setTaskDetailId(cardId);
    setTaskDetailVisible(true);
  };

  const handleTaskDetailClose = () => {
    setTaskDetailVisible(false);
    setTaskDetailId(null);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error && !boardData.lanes.length) {
    return (
      <>
        <Breadcrumb
          items={[
            ['Dashboard', '/'],
            ['MS Planner', '/msplanner/plan/' + planId],
            ['Board'],
          ]}
        />
        <ContentWrapper>
          <PageTitle>MS Planner – Board</PageTitle>
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
          ['Board'],
        ]}
      />

      <ContentWrapper>
        <PageTitle>
          {planTitle ? `${planTitle} – Board` : 'MS Planner Board'}
          <Link
            className="btn btn-sm btn-secondary ms-2"
            to={`/msplanner/plan/${planId}`}
          >
            Back to plan
          </Link>
          <Link
            className="btn btn-sm btn-outline-primary ms-2"
            to={`/msplanner/tasks/${planId}`}
          >
            List view
          </Link>
          <Link
            className="btn btn-sm btn-primary ms-2"
            to={`/msplanner/tasks/${planId}`}
          >
            Add Task
          </Link>
        </PageTitle>

        {error && (
          <div className="alert alert-warning mb-3" role="alert">
            {error}
          </div>
        )}

        {boardData.lanes.length === 0 ? (
          <div className="text-center text-muted py-5">
            No buckets in this plan. Create buckets in Microsoft Planner to see
            them here.
          </div>
        ) : (
          <div
            className="react-trello-board-wrapper"
            style={{ minHeight: 400 }}
          >
            <Board
              data={boardData}
              draggable
              laneDraggable={false}
              editable={false}
              onCardMoveAcrossLanes={handleCardMoveAcrossLanes}
              onDataChange={handleDataChange}
              onCardClick={handleCardClick}
              style={{
                backgroundColor: 'transparent',
                padding: 0,
              }}
            />
          </div>
        )}

        {movingCardId && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'rgba(0,0,0,0.2)',
              zIndex: 1050,
              pointerEvents: 'none',
            }}
          >
            <Spinner />
          </div>
        )}

        <MsPlannerTaskDetail
          taskId={taskDetailId}
          visible={taskDetailVisible}
          onClose={handleTaskDetailClose}
        />
      </ContentWrapper>
    </>
  );
};

export default MSPlannerBoardPage;

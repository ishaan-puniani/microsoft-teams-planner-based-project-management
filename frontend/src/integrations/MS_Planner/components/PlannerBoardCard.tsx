import { createContext, useContext, useCallback } from 'react';
import MsPlannerTaskListItem, {
  type PlannerTask,
  type GraphUser,
} from './MsPlannerTaskListItem';

interface BucketOption {
  id: string;
  name?: string;
}

export interface PlannerBoardCardContextValue {
  planId: string;
  categories: Record<string, string>;
  buckets: BucketOption[];
  users: GraphUser[];
  onTaskUpdate: (updated: PlannerTask) => void;
  selectedTaskIds: string[];
  onTaskSelectionChange: (taskId: string, selected: boolean) => void;
  onTaskMove: (result: {
    sourceTaskId: string;
    destinationTask: PlannerTask;
    sourceDeleted: boolean;
    destinationPlanId: string;
    destinationBucketId: string;
  }) => void;
  onCardClick?: (cardId: string) => void;
}

const PlannerBoardCardContext = createContext<PlannerBoardCardContextValue | null>(null);

export function usePlannerBoardCardContext() {
  const ctx = useContext(PlannerBoardCardContext);
  if (!ctx) throw new Error('PlannerBoardCard must be used inside PlannerBoardCardProvider');
  return ctx;
}

export const PlannerBoardCardProvider = PlannerBoardCardContext.Provider;

interface ReactTrelloCardProps {
  id: string;
  title?: string;
  description?: string;
  label?: string;
  metadata?: PlannerTask;
  onClick?: () => void;
  [key: string]: unknown;
}

export function DefaultBoardCard(props: ReactTrelloCardProps) {
  const { id, title, label, onClick } = props;
  const ctx = useContext(PlannerBoardCardContext);
  const isSelected = !!ctx?.selectedTaskIds.includes(String(id || ''));

  const handleSelectChange = (selected: boolean) => {
    if (!ctx) return;
    ctx.onTaskSelectionChange(String(id || ''), selected);
  };

  return (
    <div
      className="card border shadow-sm default-board-card"
      style={{
        maxWidth: 300,
        width: '100%',
        cursor: onClick ? 'pointer' : undefined,
        minWidth: 0,
      }}
      onClick={(e) => (typeof onClick === 'function' ? (onClick as (ev: React.MouseEvent) => void)(e) : undefined)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && (typeof onClick === 'function' ? (onClick as (ev: React.KeyboardEvent) => void)(e) : undefined)}
    >
      <div className="card-body py-2 text-truncate d-flex align-items-start" style={{ minWidth: 0 }}>
        {ctx && (
          <div className="mr-2 mt-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className=""
              style={{ width: 16, height: 16, cursor: 'pointer' }}
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectChange(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
        <h6
          className="card-title mb-0 text-truncate"
          title={title || 'Untitled'}
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {title || 'Untitled'}
        </h6>
        {label && (
          <small
            className="text-muted d-block text-truncate mt-1"
            title={label}
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {label}
          </small>
        )}
        </div>
      </div>
    </div>
  );
}

export function PlannerBoardCard(props: ReactTrelloCardProps) {
  const { id, title, metadata, onClick } = props;
  const ctx = useContext(PlannerBoardCardContext);
  const task: PlannerTask = metadata
    ? { ...metadata, id: metadata.id || id, title: metadata.title ?? title }
    : { id, title: title ?? 'Untitled' };

  const handleClick = useCallback(() => {
    onClick?.();
    ctx?.onCardClick?.(id);
  }, [id, onClick, ctx]);

  if (!ctx) {
    return (
      <div
        className="card border shadow-sm"
        style={{ maxWidth: 300, cursor: onClick ? 'pointer' : undefined }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      >
        <div className="card-body py-2">
          <h6 className="card-title mb-0 text-truncate">{task.title ?? 'Untitled'}</h6>
        </div>
      </div>
    );
  }

  return (
    <div
      className="planner-board-card"
      style={{ maxWidth: 300, width: '100%' }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <MsPlannerTaskListItem
        task={task}
        planId={ctx.planId}
        categories={ctx.categories}
        buckets={ctx.buckets}
        users={ctx.users}
        onTaskUpdate={ctx.onTaskUpdate}
        isSelected={ctx.selectedTaskIds.includes(String(task.id || ''))}
        onSelectionChange={ctx.onTaskSelectionChange}
        onTaskMove={ctx.onTaskMove}
      />
    </div>
  );
}

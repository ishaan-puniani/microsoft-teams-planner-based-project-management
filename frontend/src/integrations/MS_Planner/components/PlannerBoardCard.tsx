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
  categories: Record<string, string>;
  buckets: BucketOption[];
  users: GraphUser[];
  onTaskUpdate: (updated: PlannerTask) => void;
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
  const { title, label, onClick } = props;
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
      <div className="card-body py-2 text-truncate" style={{ minWidth: 0 }}>
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
        categories={ctx.categories}
        buckets={ctx.buckets}
        users={ctx.users}
        onTaskUpdate={ctx.onTaskUpdate}
      />
    </div>
  );
}

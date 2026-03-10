import { useState, useMemo } from 'react';
import moment from 'moment';
import Select from 'react-select';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import { i18n } from 'src/i18n';
import MsPlannerTaskDetail from './MsPlannerTaskDetail';
import EditMsPlannerTaskDetail from './EditMsPlannerTaskDetail';

export interface PlannerTask {
  id?: string;
  title?: string;
  dueDateTime?: string | null;
  percentComplete?: number;
  createdDateTime?: string | null;
  startDateTime?: string | null;
  completedDateTime?: string | null;
  priority?: number;
  planId?: string;
  bucketId?: string;
  orderHint?: string;
  appliedCategories?: Record<string, boolean>;
  assignments?: Record<string, { '@odata.type'?: string; orderHint?: string }>;
  createdBy?: { user?: { displayName?: string | null; id?: string } };
  '@odata.etag'?: string;
}

export interface GraphUser {
  id: string;
  displayName?: string | null;
  mail?: string | null;
  userPrincipalName?: string | null;
}

const PLANNER_ASSIGNMENT = { '@odata.type': '#microsoft.graph.plannerAssignment', orderHint: ' !' } as const;

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const m = moment(value);
  return m.isValid() ? m.format('YYYY-MM-DD') : '—';
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const m = moment(value);
  return m.isValid() ? m.format('YYYY-MM-DD HH:mm') : '—';
}

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Urgent',
  5: 'Important',
  9: 'Medium',
  10: 'Low',
};

interface BucketOption {
  id: string;
  name?: string;
}

interface MsPlannerTaskListItemProps {
  task: PlannerTask;
  categories?: Record<string, string>;
  buckets?: BucketOption[];
  users?: GraphUser[];
  onTaskUpdate: (updated: PlannerTask) => void;
}

const MsPlannerTaskListItem = ({
  task,
  categories = {},
  buckets = [],
  users = [],
  onTaskUpdate,
}: MsPlannerTaskListItemProps) => {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const priorityLabel =
    task.priority != null && PRIORITY_LABELS[task.priority]
      ? PRIORITY_LABELS[task.priority]
      : null;

  const etag = task['@odata.etag'];
  const assignedIds = Object.keys(task.assignments || {});

  const categoryOptions = useMemo(() => {
    return Object.entries(categories)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([value, label]) => ({ value, label }));
  }, [categories]);

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: u.displayName || u.mail || u.userPrincipalName || u.id,
      })),
    [users],
  );

  const selectedCategoryOptions = useMemo(
    () =>
      categoryOptions.filter((opt) => !!task.appliedCategories?.[opt.value]),
    [categoryOptions, task.appliedCategories],
  );

  const selectedUserOptions = useMemo(
    () => userOptions.filter((opt) => assignedIds.includes(opt.value)),
    [userOptions, assignedIds],
  );

  const bucketOptions = useMemo(
    () =>
      buckets.map((b) => ({
        value: b.id,
        label: b.name || b.id || '—',
      })),
    [buckets],
  );

  const selectedBucketOption = useMemo(
    () => bucketOptions.find((opt) => opt.value === task.bucketId) || null,
    [bucketOptions, task.bucketId],
  );

  const handleBucketChange = (selected: { value: string; label: string } | null) => {
    if (!task.id || !etag) return;
    const bucketId = selected?.value ?? null;
    applyPatch({ bucketId });
  };

  const handleCategoriesChange = (
    selected: ReadonlyArray<{ value: string; label: string }> | null,
  ) => {
    if (!task.id || !etag) return;
    const keys = selected ? [...selected].map((s) => s.value) : [];
    const next: Record<string, boolean> = {};
    categoryOptions.forEach((opt) => {
      next[opt.value] = keys.includes(opt.value);
    });
    applyPatch({ appliedCategories: next });
  };

  const handleAssignmentsChange = (
    selected: ReadonlyArray<{ value: string; label: string }> | null,
  ) => {
    if (!task.id || !etag) return;
    const ids = selected ? [...selected].map((s) => s.value) : [];
    const next: Record<string, typeof PLANNER_ASSIGNMENT | null> = {};
    assignedIds.forEach((id) => {
      next[id] = ids.includes(id) ? PLANNER_ASSIGNMENT : null;
    });
    ids.forEach((id) => {
      if (!(id in next)) next[id] = PLANNER_ASSIGNMENT;
    });
    applyPatch({ assignments: next });
  };

  const applyPatch = async (patch: {
    appliedCategories?: Record<string, boolean>;
    assignments?: Record<string, typeof PLANNER_ASSIGNMENT | null>;
    bucketId?: string | null;
  }) => {
    if (!task.id || !etag) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      const payload: any = { etag };
      if (patch.appliedCategories !== undefined) payload.appliedCategories = patch.appliedCategories;
      if (patch.assignments !== undefined) payload.assignments = patch.assignments;
      if (patch.bucketId !== undefined) payload.bucketId = patch.bucketId;
      const updated = await MsPlannerService.updateTask(task.id, payload);
      onTaskUpdate(updated);
    } catch (err: any) {
      setUpdateError(err?.response?.data?.message || err?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6
            className="card-title mb-0 text-truncate flex-grow-1"
            title={task.title}
            style={{ cursor: 'pointer' }}
            onClick={() => task.id && setDetailTaskId(task.id)}
          >
            {task.title ?? 'Untitled task'}
          </h6>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary ml-1"
            onClick={(e) => {
              e.stopPropagation();
              task.id && setEditTaskId(task.id);
            }}
          >
            Edit
          </button>
        </div>
        <div className="card-text small text-muted">
          <div className="mb-1">
            <span className="text-dark">Due:</span> {formatDate(task.dueDateTime)}
          </div>
          <div className="mb-1">
            <span className="text-dark">Progress:</span>{' '}
            <span className="badge badge-secondary">
              {task.percentComplete ?? 0}%
            </span>
          </div>
          <div className="mb-1">
            <span className="text-dark">Created:</span>{' '}
            {formatDateTime(task.createdDateTime)}
          </div>
          {priorityLabel && (
            <div className="mb-2">
              <span className="text-dark">Priority:</span>{' '}
              <span className="badge badge-info">{priorityLabel}</span>
            </div>
          )}
        </div>

        {(categoryOptions.length > 0 || userOptions.length > 0 || bucketOptions.length > 0) && (
          <div className="border-top pt-2 mt-2 small">
            {updateError && (
              <div className="alert alert-danger py-1 px-2 mb-2 small">{updateError}</div>
            )}
            {bucketOptions.length > 0 && (
              <div className="mb-2">
                <label className="d-block text-dark font-weight-bold mb-1">Bucket</label>
                <Select
                  className="w-100"
                  value={selectedBucketOption}
                  onChange={handleBucketChange}
                  options={bucketOptions}
                  isClearable
                  placeholder="Select bucket..."
                  isDisabled={!etag || updating}
                  styles={{
                    control: (provided) => ({ ...provided, minHeight: 34 }),
                    valueContainer: (provided) => ({ ...provided, padding: '0 6px' }),
                  }}
                  noOptionsMessage={() => i18n('autocomplete.noOptions')}
                />
              </div>
            )}
            {categoryOptions.length > 0 && (
              <div className="mb-2">
                <label className="d-block text-dark font-weight-bold mb-1">Categories</label>
                <Select
                  className="w-100"
                  value={selectedCategoryOptions}
                  onChange={handleCategoriesChange}
                  options={categoryOptions}
                  isMulti
                  isClearable
                  placeholder="Select categories..."
                  isDisabled={!etag || updating}
                  styles={{
                    control: (provided) => ({ ...provided, minHeight: 34 }),
                    valueContainer: (provided) => ({ ...provided, padding: '0 6px' }),
                  }}
                  noOptionsMessage={() => i18n('autocomplete.noOptions')}
                />
              </div>
            )}
            {userOptions.length > 0 && (
              <div>
                <label className="d-block text-dark font-weight-bold mb-1">Assignments</label>
                <Select
                  className="w-100"
                  value={selectedUserOptions}
                  onChange={handleAssignmentsChange}
                  options={userOptions}
                  isMulti
                  isClearable
                  placeholder="Select assignees..."
                  isDisabled={!etag || updating}
                  styles={{
                    control: (provided) => ({ ...provided, minHeight: 34 }),
                    valueContainer: (provided) => ({ ...provided, padding: '0 6px' }),
                  }}
                  noOptionsMessage={() => i18n('autocomplete.noOptions')}
                />
              </div>
            )}
            {updating && (
              <div className="text-muted mt-1">Updating…</div>
            )}
          </div>
        )}

        <MsPlannerTaskDetail
          taskId={detailTaskId}
          visible={!!detailTaskId}
          onClose={() => setDetailTaskId(null)}
          categories={categories}
        />
        <EditMsPlannerTaskDetail
          taskId={editTaskId}
          visible={!!editTaskId}
          onClose={() => setEditTaskId(null)}
          onSuccess={(updated) => {
            onTaskUpdate(updated);
            setEditTaskId(null);
          }}
          categories={categories}
          users={users}
        />
      </div>
    </div>
  );
};

export default MsPlannerTaskListItem;

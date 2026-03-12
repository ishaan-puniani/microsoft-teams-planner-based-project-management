import { useState } from 'react';
import Select from 'react-select';

export interface MsPlannerFilters {
  buckets: string[];
  statuses: Array<'notStarted' | 'inProgress' | 'completed'>;
  categories: string[];
  priorities: Array<'urgent' | 'important' | 'medium' | 'low'>;
  assignedTos: string[];
  startDateFrom: string;
  startDateTo: string;
}

export const EMPTY_FILTERS: MsPlannerFilters = {
  buckets: [],
  statuses: [],
  categories: [],
  priorities: [],
  assignedTos: [],
  startDateFrom: '',
  startDateTo: '',
};

const STATUS_OPTIONS: Array<{
  value: MsPlannerFilters['statuses'][number];
  label: string;
}> = [
  { value: 'notStarted', label: 'Not Started' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: Array<{
  value: MsPlannerFilters['priorities'][number];
  label: string;
}> = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'important', label: 'Important' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

interface MsPlannerFilterProps {
  buckets?: Array<{ id: string; name?: string }>;
  categories?: Record<string, string>;
  users?: Array<{
    id: string;
    displayName?: string | null;
    mail?: string | null;
  }>;
  onFilterChange: (filters: MsPlannerFilters) => void;
}

const MsPlannerFilter = ({
  buckets = [],
  categories = {},
  users = [],
  onFilterChange,
}: MsPlannerFilterProps) => {
  const [filters, setFilters] = useState<MsPlannerFilters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState(false);

  const bucketOptions = buckets.map((b) => ({
    value: b.id,
    label: b.name || b.id,
  }));

  const categoryOptions = Object.entries(categories)
    .filter(([, label]) => label)
    .map(([key, label]) => ({ value: key, label }));

  const userOptions = users.map((u) => ({
    value: u.id,
    label: u.displayName || u.mail || u.id,
  }));

  const update = (patch: Partial<MsPlannerFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFilterChange(next);
  };

  const reset = () => {
    setFilters(EMPTY_FILTERS);
    onFilterChange(EMPTY_FILTERS);
  };

  const activeCount =
    filters.buckets.length +
    filters.statuses.length +
    filters.categories.length +
    filters.priorities.length +
    filters.assignedTos.length +
    (filters.startDateFrom ? 1 : 0) +
    (filters.startDateTo ? 1 : 0);

  return (
    <div className="card mb-3">
      <div
        className="card-header d-flex align-items-center justify-content-between"
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="fw-semibold">
          Filters{' '}
          {activeCount > 0 && (
            <span className="badge bg-primary ms-1">{activeCount}</span>
          )}
        </span>
        <span className="d-flex align-items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
            >
              Clear all
            </button>
          )}
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} />
        </span>
      </div>

      {expanded && (
        <div className="card-body">
          <div className="row g-3">
            {/* Bucket */}
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label small fw-semibold mb-1">Bucket</label>
              <Select
                isMulti
                options={bucketOptions}
                value={bucketOptions.filter((o) =>
                  filters.buckets.includes(o.value),
                )}
                onChange={(sel) =>
                  update({ buckets: sel.map((s) => s.value) })
                }
                placeholder="All buckets…"
                classNamePrefix="react-select"
              />
            </div>

            {/* Status */}
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label small fw-semibold mb-1">Status</label>
              <Select
                isMulti
                options={STATUS_OPTIONS}
                value={STATUS_OPTIONS.filter((o) =>
                  filters.statuses.includes(o.value),
                )}
                onChange={(sel) =>
                  update({ statuses: sel.map((s) => s.value) })
                }
                placeholder="All statuses…"
                classNamePrefix="react-select"
              />
            </div>

            {/* Priority */}
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label small fw-semibold mb-1">Priority</label>
              <Select
                isMulti
                options={PRIORITY_OPTIONS}
                value={PRIORITY_OPTIONS.filter((o) =>
                  filters.priorities.includes(o.value),
                )}
                onChange={(sel) =>
                  update({ priorities: sel.map((s) => s.value) })
                }
                placeholder="All priorities…"
                classNamePrefix="react-select"
              />
            </div>

            {/* Categories */}
            {categoryOptions.length > 0 && (
              <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label small fw-semibold mb-1">
                  Categories
                </label>
                <Select
                  isMulti
                  options={categoryOptions}
                  value={categoryOptions.filter((o) =>
                    filters.categories.includes(o.value),
                  )}
                  onChange={(sel) =>
                    update({ categories: sel.map((s) => s.value) })
                  }
                  placeholder="All categories…"
                  classNamePrefix="react-select"
                />
              </div>
            )}

            {/* Assigned To */}
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label small fw-semibold mb-1">
                Assigned To
              </label>
              <Select
                isMulti
                options={userOptions}
                value={userOptions.filter((o) =>
                  filters.assignedTos.includes(o.value),
                )}
                onChange={(sel) =>
                  update({ assignedTos: sel.map((s) => s.value) })
                }
                placeholder="All assignees…"
                classNamePrefix="react-select"
              />
            </div>

            {/* Start Date From */}
            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold mb-1">
                Start Date From
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.startDateFrom}
                onChange={(e) => update({ startDateFrom: e.target.value })}
              />
            </div>

            {/* Start Date To */}
            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small fw-semibold mb-1">
                Start Date To
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.startDateTo}
                onChange={(e) => update({ startDateTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MsPlannerFilter;
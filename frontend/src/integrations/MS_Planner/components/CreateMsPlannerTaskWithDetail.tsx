import { useEffect, useState, useMemo } from 'react';
import { Modal } from 'bootstrap';
import { useRef } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import { i18n } from 'src/i18n';

const PRIORITY_OPTIONS = [
  { value: 1, label: 'Urgent' },
  { value: 5, label: 'Important' },
  { value: 9, label: 'Medium' },
  { value: 10, label: 'Low' },
];

const PLANNER_ASSIGNMENT = {
  '@odata.type': '#microsoft.graph.plannerAssignment',
  orderHint: ' !',
};

interface ChecklistItemForm {
  key: string;
  title: string;
  isChecked: boolean;
}

interface CreateMsPlannerTaskWithDetailProps {
  planId: string | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: (task: any) => void;
  categories?: Record<string, string>;
  users?: Array<{ id: string; displayName?: string | null; mail?: string | null; userPrincipalName?: string | null }>;
}

const CreateMsPlannerTaskWithDetail = ({
  planId,
  visible,
  onClose,
  onSuccess,
  categories = {},
  users = [],
}: CreateMsPlannerTaskWithDetailProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalInstanceRef = useRef<any>(null);
  const [buckets, setBuckets] = useState<Array<{ id: string; name?: string }>>([]);
  const [loadingBuckets, setLoadingBuckets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bucketId, setBucketId] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<number | ''>(5);
  const [startDateTime, setStartDateTime] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');
  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItemForm[]>([]);

  const categoryOptions = useMemo(
    () =>
      Object.entries(categories)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([value, label]) => ({ value, label })),
    [categories],
  );
  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: u.displayName || u.mail || u.userPrincipalName || u.id,
      })),
    [users],
  );
  const bucketOptions = useMemo(
    () =>
      buckets.map((b) => ({ value: b.id, label: b.name || b.id })),
    [buckets],
  );

  useEffect(() => {
    if (!visible || !planId) return;
    if (!modalRef.current) return;
    const modal = new Modal(modalRef.current);
    modal.show();
    modalInstanceRef.current = modal;
    return () => {
      modalInstanceRef.current?.hide();
    };
  }, [visible, planId]);

  useEffect(() => {
    if (!visible || !planId) {
      setBuckets([]);
      setBucketId('');
      setTitle('');
      setNote('');
      setPriority(5);
      setStartDateTime('');
      setDueDateTime('');
      setSelectedCategoryKeys([]);
      setSelectedUserIds([]);
      setChecklist([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoadingBuckets(true);
    MsPlannerService.getBuckets(planId)
      .then((data: any[]) => {
        if (cancelled) return;
        const list = data || [];
        setBuckets(list);
        if (list.length) {
          setBucketId(list[0].id);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load buckets');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingBuckets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, planId]);

  const handleClose = () => {
    modalInstanceRef.current?.hide();
    onClose();
  };

  const addChecklistItem = () => {
    setChecklist((prev) => [
      ...prev,
      { key: `item_${Date.now()}`, title: '', isChecked: false },
    ]);
  };

  const updateChecklistItem = (index: number, field: 'title' | 'isChecked', value: any) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeChecklistItem = (index: number) => {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!planId) return;
    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }
    if (!bucketId) {
      setError('Please select a bucket.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const appliedCategories: Record<string, boolean> = {};
      categoryOptions.forEach((opt) => {
        appliedCategories[opt.value] = selectedCategoryKeys.includes(opt.value);
      });
      const assignments: Record<string, any> = {};
      selectedUserIds.forEach((id) => {
        assignments[id] = PLANNER_ASSIGNMENT;
      });

      const created = await MsPlannerService.createTask(planId, {
        bucketId,
        title: trimmedTitle,
        priority: priority === '' ? undefined : Number(priority),
        startDateTime: startDateTime || undefined,
        dueDateTime: dueDateTime || undefined,
        appliedCategories: Object.keys(appliedCategories).length ? appliedCategories : undefined,
        assignments: Object.keys(assignments).length ? assignments : undefined,
      });

      const taskId = created?.id;
      if (taskId && (note.trim() || checklist.some((c) => c.title.trim()))) {
        const checklistPayload: Record<string, any> = {};
        checklist.forEach((item) => {
          if (item.title.trim()) {
            checklistPayload[item.key] = {
              '@odata.type': 'microsoft.graph.plannerChecklistItem',
              title: item.title.trim().slice(0, 100),
              isChecked: item.isChecked,
            };
          }
        });
        await MsPlannerService.updateTaskDetails(taskId, {
          detailsEtag: '',
          description: note.trim() || undefined,
          checklist: Object.keys(checklistPayload).length ? checklistPayload : undefined,
        });
      }

      const fullTask = taskId ? await MsPlannerService.getTask(taskId) : created;
      onSuccess(fullTask);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  const content = (
    <div ref={modalRef} className="modal" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add task</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              onClick={handleClose}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}
            {loadingBuckets && buckets.length === 0 && (
              <div className="text-center py-4">Loading buckets...</div>
            )}
            {(!loadingBuckets || buckets.length > 0) && (
              <>
                {bucketOptions.length > 0 && (
                  <div className="form-group">
                    <label>Bucket <span className="text-danger">*</span></label>
                    <Select
                      className="w-100"
                      value={bucketOptions.find((o) => o.value === bucketId) ?? null}
                      onChange={(opt) => setBucketId(opt?.value ?? '')}
                      options={bucketOptions}
                      isClearable={false}
                      placeholder="Select bucket..."
                      noOptionsMessage={() => i18n('autocomplete.noOptions')}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                  />
                </div>
                <div className="form-group">
                  <label>Note / Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Description"
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <Select
                    className="w-100"
                    value={PRIORITY_OPTIONS.find((o) => o.value === priority) ?? null}
                    onChange={(opt) => setPriority(opt?.value ?? 5)}
                    options={PRIORITY_OPTIONS}
                    isClearable={false}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 form-group">
                    <label>Start date</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Due date</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={dueDateTime}
                      onChange={(e) => setDueDateTime(e.target.value)}
                    />
                  </div>
                </div>
                {categoryOptions.length > 0 && (
                  <div className="form-group">
                    <label>Categories</label>
                    <Select
                      className="w-100"
                      value={categoryOptions.filter((o) =>
                        selectedCategoryKeys.includes(o.value),
                      )}
                      onChange={(selected) =>
                        setSelectedCategoryKeys(
                          selected ? [...selected].map((s) => s.value) : [],
                        )
                      }
                      options={categoryOptions}
                      isMulti
                      isClearable
                      placeholder="Select categories..."
                      noOptionsMessage={() => i18n('autocomplete.noOptions')}
                    />
                  </div>
                )}
                {userOptions.length > 0 && (
                  <div className="form-group">
                    <label>Assignments</label>
                    <Select
                      className="w-100"
                      value={userOptions.filter((o) =>
                        selectedUserIds.includes(o.value),
                      )}
                      onChange={(selected) =>
                        setSelectedUserIds(
                          selected ? [...selected].map((s) => s.value) : [],
                        )
                      }
                      options={userOptions}
                      isMulti
                      isClearable
                      placeholder="Select assignees..."
                      noOptionsMessage={() => i18n('autocomplete.noOptions')}
                    />
                  </div>
                )}
                <div className="form-group">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="mb-0">Checklist</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={addChecklistItem}
                    >
                      Add item
                    </button>
                  </div>
                  {checklist.length === 0 && (
                    <p className="text-muted small">No checklist items.</p>
                  )}
                  {checklist.map((item, index) => (
                    <div
                      key={item.key}
                      className="input-group input-group-sm mb-2"
                    >
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            onChange={(e) =>
                              updateChecklistItem(index, 'isChecked', e.target.checked)
                            }
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        value={item.title}
                        onChange={(e) =>
                          updateChecklistItem(index, 'title', e.target.value)
                        }
                        placeholder="Checklist item"
                      />
                      <div className="input-group-append">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeChecklistItem(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreate}
              disabled={saving || !title?.trim() || !bucketId || (loadingBuckets && buckets.length === 0)}
            >
              {saving ? 'Creating...' : 'Create task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    content,
    document.getElementById('modal-root') || document.body,
  ) as unknown as JSX.Element;
};

export default CreateMsPlannerTaskWithDetail;

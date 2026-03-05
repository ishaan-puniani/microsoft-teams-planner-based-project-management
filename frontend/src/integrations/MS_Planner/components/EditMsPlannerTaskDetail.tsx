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

interface EditMsPlannerTaskDetailProps {
  taskId: string | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: (task: any) => void;
  categories?: Record<string, string>;
  users?: Array<{ id: string; displayName?: string | null; mail?: string | null; userPrincipalName?: string | null }>;
}

const EditMsPlannerTaskDetail = ({
  taskId,
  visible,
  onClose,
  onSuccess,
  categories = {},
  users = [],
}: EditMsPlannerTaskDetailProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalInstanceRef = useRef<any>(null);
  const [task, setTask] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!visible || !taskId) return;
    if (!modalRef.current) return;
    const modal = new Modal(modalRef.current);
    modal.show();
    modalInstanceRef.current = modal;
    return () => {
      modalInstanceRef.current?.hide();
    };
  }, [visible, taskId]);

  useEffect(() => {
    if (!visible || !taskId) {
      setTask(null);
      setDetails(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      MsPlannerService.getTask(taskId),
      MsPlannerService.getTaskDetails(taskId),
    ])
      .then(([taskData, detailsData]) => {
        if (cancelled) return;
        setTask(taskData);
        setDetails(detailsData);
        setTitle(taskData.title ?? '');
        setNote(detailsData.description ?? '');
        setPriority(taskData.priority ?? 5);
        setStartDateTime(
          taskData.startDateTime
            ? taskData.startDateTime.slice(0, 16)
            : '',
        );
        setDueDateTime(
          taskData.dueDateTime ? taskData.dueDateTime.slice(0, 16) : '',
        );
        setSelectedCategoryKeys(
          taskData.appliedCategories
            ? Object.entries(taskData.appliedCategories)
                .filter(([, v]) => v)
                .map(([k]) => k)
            : [],
        );
        setSelectedUserIds(Object.keys(taskData.assignments || {}));
        const checklistEntries = detailsData?.checklist
          ? Object.entries(detailsData.checklist)
          : [];
        setChecklist(
          checklistEntries.map(([key, item]: [string, any]) => ({
            key,
            title: item?.title ?? '',
            isChecked: !!item?.isChecked,
          })),
        );
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load task');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, taskId]);

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

  const handleSave = async () => {
    if (!taskId || !task) return;
    const etag = task['@odata.etag'];
    const detailsEtag = details?._detailsEtag;
    if (!etag) {
      setError('Task version missing. Please refresh and try again.');
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
      const prevAssigned = Object.keys(task.assignments || {});
      prevAssigned.forEach((id) => {
        if (!selectedUserIds.includes(id)) assignments[id] = null;
      });

      await MsPlannerService.updateTask(taskId, {
        etag,
        title: title || undefined,
        priority: priority === '' ? undefined : Number(priority),
        startDateTime: startDateTime || null,
        dueDateTime: dueDateTime || null,
        appliedCategories,
        assignments,
      });

      if (detailsEtag) {
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
          detailsEtag,
          description: note,
          checklist: checklistPayload,
        });
      }

      const updatedTask = await MsPlannerService.getTask(taskId);
      onSuccess(updatedTask);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Save failed');
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
            <h5 className="modal-title">Edit task</h5>
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
            {loading && !task && (
              <div className="text-center py-4">Loading...</div>
            )}
            {!loading && task && (
              <>
                <div className="form-group">
                  <label>Title</label>
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
              onClick={handleSave}
              disabled={saving || !task}
            >
              {saving ? 'Saving...' : 'Save'}
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

export default EditMsPlannerTaskDetail;

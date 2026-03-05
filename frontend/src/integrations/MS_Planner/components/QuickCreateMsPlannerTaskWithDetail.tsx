import { useEffect, useState, useMemo } from 'react';
import { Modal } from 'bootstrap';
import { useRef } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import { i18n } from 'src/i18n';

const PLANNER_ASSIGNMENT = {
  '@odata.type': '#microsoft.graph.plannerAssignment',
  orderHint: ' !',
};

const QUICK_FORMAT_EXAMPLE = `title task 1
description task 1
-list item 1
-list item 2

title task 2
description task 2
-task 2 list item 1
-task 2 list item 2`;

export interface ParsedTask {
  title: string;
  description: string;
  checklist: string[];
}

function parseQuickFormat(text: string): ParsedTask[] {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const result: ParsedTask[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trimEnd());
    const title = lines[0] ?? '';
    const description = lines[1] ?? '';
    const checklist: string[] = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('-')) {
        checklist.push(line.replace(/^-\s*/, '').trim());
      }
    }
    if (title) {
      result.push({ title, description, checklist });
    }
  }

  return result;
}

function serializeToQuickFormat(tasks: ParsedTask[]): string {
  return tasks
    .map((t) => {
      const lines = [t.title, t.description, ...t.checklist.map((c) => (c.trim() ? `- ${c.trim()}` : '-'))];
      return lines.join('\n');
    })
    .join('\n\n');
}

interface QuickCreateMsPlannerTaskWithDetailProps {
  planId: string | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: (tasks: any[] | any) => void;
  categories?: Record<string, string>;
  users?: Array<{ id: string; displayName?: string | null; mail?: string | null; userPrincipalName?: string | null }>;
}

const QuickCreateMsPlannerTaskWithDetail = ({
  planId,
  visible,
  onClose,
  onSuccess,
  categories = {},
  users = [],
}: QuickCreateMsPlannerTaskWithDetailProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalInstanceRef = useRef<any>(null);
  const [buckets, setBuckets] = useState<Array<{ id: string; name?: string }>>([]);
  const [loadingBuckets, setLoadingBuckets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bucketId, setBucketId] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTasks, setPreviewTasks] = useState<ParsedTask[]>([]);
  const [priority, setPriority] = useState<number | ''>(5);
  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [transcript, setTranscript] = useState('');
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

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
    () => buckets.map((b) => ({ value: b.id, label: b.name || b.id })),
    [buckets],
  );

  const parsedTasks = useMemo(() => parseQuickFormat(textareaValue), [textareaValue]);
  const tasksToUse = showPreview ? previewTasks : parsedTasks;
  const parsedCount = tasksToUse.length;

  const handleTogglePreview = () => {
    if (showPreview) {
      setTextareaValue(serializeToQuickFormat(previewTasks));
      setShowPreview(false);
    } else {
      setPreviewTasks(parsedTasks.map((t) => ({ ...t, checklist: [...t.checklist] })));
      setShowPreview(true);
    }
  };

  const updatePreviewTask = (index: number, field: keyof ParsedTask, value: string | string[]) => {
    setPreviewTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
  };

  const updatePreviewChecklistItem = (taskIndex: number, itemIndex: number, value: string) => {
    setPreviewTasks((prev) =>
      prev.map((t, i) => {
        if (i !== taskIndex) return t;
        const next = [...t.checklist];
        next[itemIndex] = value;
        return { ...t, checklist: next };
      }),
    );
  };

  const addPreviewChecklistItem = (taskIndex: number) => {
    setPreviewTasks((prev) =>
      prev.map((t, i) =>
        i === taskIndex ? { ...t, checklist: [...t.checklist, ''] } : t,
      ),
    );
  };

  const removePreviewChecklistItem = (taskIndex: number, itemIndex: number) => {
    setPreviewTasks((prev) =>
      prev.map((t, i) => {
        if (i !== taskIndex) return t;
        return { ...t, checklist: t.checklist.filter((_, j) => j !== itemIndex) };
      }),
    );
  };

  const handleGetTasksFromTranscript = async () => {
    const text = transcript?.trim();
    if (!text) {
      setTranscriptError('Paste a transcript first.');
      return;
    }
    setLoadingTranscript(true);
    setTranscriptError(null);
    try {
      const data = await MsPlannerService.getTasksFromTranscript(text);
      const tasksText = data?.tasksText ?? '';
      setTextareaValue(tasksText);
      setShowPreview(false);
      if (tasksText) {
        setPreviewTasks([]);
      }
    } catch (err: any) {
      setTranscriptError(err?.response?.data?.message || err?.message || 'Failed to get tasks from transcript');
    } finally {
      setLoadingTranscript(false);
    }
  };

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
      setTextareaValue('');
      setShowPreview(false);
      setPreviewTasks([]);
      setTranscript('');
      setTranscriptError(null);
      setPriority(5);
      setSelectedCategoryKeys([]);
      setSelectedUserIds([]);
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

  const handleCreate = async () => {
    if (!planId) return;
    if (!bucketId) {
      setError('Please select a bucket.');
      return;
    }
    if (parsedTasks.length === 0) {
      setError('Enter at least one task. Use the format: title on first line, description on second, then -checklist items.');
      return;
    }

    setSaving(true);
    setError(null);

    const appliedCategories: Record<string, boolean> = {};
    categoryOptions.forEach((opt) => {
      appliedCategories[opt.value] = selectedCategoryKeys.includes(opt.value);
    });
    const assignments: Record<string, any> = {};
    selectedUserIds.forEach((id) => {
      assignments[id] = PLANNER_ASSIGNMENT;
    });

    const createdTasks: any[] = [];

    try {
      for (const task of tasksToUse) {
        const created = await MsPlannerService.createTask(planId, {
          bucketId,
          title: task.title.trim().slice(0, 255),
          priority: priority === '' ? undefined : Number(priority),
          appliedCategories: Object.keys(appliedCategories).length ? appliedCategories : undefined,
          assignments: Object.keys(assignments).length ? assignments : undefined,
        });

        const taskId = created?.id;
        if (taskId && (task.description.trim() || task.checklist.length > 0)) {
          const checklistPayload: Record<string, any> = {};
          task.checklist.forEach((title, idx) => {
            const t = title.trim();
            if (t) {
              checklistPayload[`item_${Date.now()}_${idx}`] = {
                '@odata.type': 'microsoft.graph.plannerChecklistItem',
                title: t.slice(0, 100),
                isChecked: false,
              };
            }
          });
          await MsPlannerService.updateTaskDetails(taskId, {
            detailsEtag: '',
            description: task.description.trim() || undefined,
            checklist: Object.keys(checklistPayload).length ? checklistPayload : undefined,
          });
        }

        const fullTask = taskId ? await MsPlannerService.getTask(taskId) : created;
        createdTasks.push(fullTask);
      }

      onSuccess(createdTasks);
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
            <h5 className="modal-title">Quick add tasks</h5>
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
            {error && <div className="alert alert-danger">{error}</div>}
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
                <div className="form-group border rounded p-2 bg-light mb-3">
                  <label className="small font-weight-bold mb-1">Get tasks from transcript (AI)</label>
                  <textarea
                    className="form-control form-control-sm mb-2"
                    rows={4}
                    value={transcript}
                    onChange={(e) => {
                      setTranscript(e.target.value);
                      setTranscriptError(null);
                    }}
                    placeholder="Paste meeting notes, call transcript, or any text…"
                  />
                  {transcriptError && (
                    <div className="alert alert-danger py-1 px-2 mb-2 small">{transcriptError}</div>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleGetTasksFromTranscript}
                    disabled={loadingTranscript || !transcript?.trim()}
                  >
                    {loadingTranscript ? 'Getting tasks…' : 'Get Tasks from Transcript'}
                  </button>
                </div>
                <div className="form-group">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="mb-0">
                      Tasks (one block per task){' '}
                      {parsedCount > 0 && (
                        <span className="text-muted small font-weight-normal">
                          — {parsedCount} task{parsedCount !== 1 ? 's' : ''} detected
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleTogglePreview}
                      disabled={!showPreview && parsedTasks.length === 0}
                    >
                      {showPreview ? 'Edit text' : 'Preview'}
                    </button>
                  </div>

                  {showPreview ? (
                    <div className="border rounded p-2 bg-light" style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {tasksToUse.length === 0 ? (
                        <p className="text-muted small mb-0">No tasks to preview. Switch to &quot;Edit text&quot; and add tasks in the format above.</p>
                      ) : (
                        tasksToUse.map((task, taskIndex) => (
                          <div key={taskIndex} className="card mb-2">
                            <div className="card-body py-2 px-3">
                              <div className="form-group mb-2">
                                <label className="small mb-0 font-weight-bold">Title</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={task.title}
                                  onChange={(e) => updatePreviewTask(taskIndex, 'title', e.target.value)}
                                  placeholder="Task title"
                                />
                              </div>
                              <div className="form-group mb-2">
                                <label className="small mb-0 font-weight-bold">Description</label>
                                <textarea
                                  className="form-control form-control-sm"
                                  rows={2}
                                  value={task.description}
                                  onChange={(e) => updatePreviewTask(taskIndex, 'description', e.target.value)}
                                  placeholder="Description"
                                />
                              </div>
                              <div className="form-group mb-0">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <label className="small mb-0 font-weight-bold">Checklist</label>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary py-0 px-1"
                                    onClick={() => addPreviewChecklistItem(taskIndex)}
                                  >
                                    + Add
                                  </button>
                                </div>
                                {task.checklist.length === 0 ? (
                                  <p className="text-muted small mb-0">No items</p>
                                ) : (
                                  <ul className="list-unstyled mb-0">
                                    {task.checklist.map((item, itemIndex) => (
                                      <li key={itemIndex} className="input-group input-group-sm mb-1">
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={item}
                                          onChange={(e) => updatePreviewChecklistItem(taskIndex, itemIndex, e.target.value)}
                                          placeholder="Checklist item"
                                        />
                                        <div className="input-group-append">
                                          <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removePreviewChecklistItem(taskIndex, itemIndex)}
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <>
                      <textarea
                        className="form-control font-monospace small"
                        rows={14}
                        value={textareaValue}
                        onChange={(e) => setTextareaValue(e.target.value)}
                        placeholder={QUICK_FORMAT_EXAMPLE}
                        spellCheck={false}
                      />
                      <small className="form-text text-muted">
                        Format: first line = title, second = description, lines starting with &quot;-&quot; = checklist. Separate tasks with a blank line.
                      </small>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label>Priority (applies to all)</label>
                  <Select
                    className="w-100"
                    value={[
                      { value: 1, label: 'Urgent' },
                      { value: 5, label: 'Important' },
                      { value: 9, label: 'Medium' },
                      { value: 10, label: 'Low' },
                    ].find((o) => o.value === priority) ?? null}
                    onChange={(opt) => setPriority(opt?.value ?? 5)}
                    options={[
                      { value: 1, label: 'Urgent' },
                      { value: 5, label: 'Important' },
                      { value: 9, label: 'Medium' },
                      { value: 10, label: 'Low' },
                    ]}
                    isClearable={false}
                  />
                </div>
                {categoryOptions.length > 0 && (
                  <div className="form-group">
                    <label>Categories (applies to all)</label>
                    <Select
                      className="w-100"
                      value={categoryOptions.filter((o) => selectedCategoryKeys.includes(o.value))}
                      onChange={(selected) =>
                        setSelectedCategoryKeys(selected ? [...selected].map((s) => s.value) : [])
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
                    <label>Assignments (applies to all)</label>
                    <Select
                      className="w-100"
                      value={userOptions.filter((o) => selectedUserIds.includes(o.value))}
                      onChange={(selected) =>
                        setSelectedUserIds(selected ? [...selected].map((s) => s.value) : [])
                      }
                      options={userOptions}
                      isMulti
                      isClearable
                      placeholder="Select assignees..."
                      noOptionsMessage={() => i18n('autocomplete.noOptions')}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreate}
              disabled={
                saving ||
                !bucketId ||
                parsedCount === 0 ||
                (loadingBuckets && buckets.length === 0)
              }
            >
              {saving ? 'Creating...' : `Create ${parsedCount} task${parsedCount !== 1 ? 's' : ''}`}
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

export default QuickCreateMsPlannerTaskWithDetail;

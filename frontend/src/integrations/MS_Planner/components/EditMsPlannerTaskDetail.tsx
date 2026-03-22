import { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal } from 'bootstrap';
import { useRef } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import { toGraphDateTimeOrNull } from 'src/integrations/MS_Planner/plannerDateTimeForGraph';
import {
  plannerReferenceKeyFromUrl,
  plannerReferenceKeyToDisplayUrl,
} from 'src/integrations/MS_Planner/plannerReferenceKey';
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

interface ReferenceItemForm {
  /** Stable row id for React */
  rowId: string;
  url: string;
  alias: string;
}

function normalizeReferenceUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

interface EditMsPlannerTaskDetailProps {
  taskId: string | null;
  /** Plan id from route (preferred for uploads; Graph task may omit `planId` on some responses). */
  planId?: string | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: (task: any) => void;
  categories?: Record<string, string>;
  users?: Array<{ id: string; displayName?: string | null; mail?: string | null; userPrincipalName?: string | null }>;
}

const EditMsPlannerTaskDetail = ({
  taskId,
  planId: planIdProp,
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
  const [references, setReferences] = useState<ReferenceItemForm[]>([]);
  const [initialReferenceKeys, setInitialReferenceKeys] = useState<string[]>([]);
  const [attachmentUploadsInFlight, setAttachmentUploadsInFlight] = useState(0);

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

  const attachmentInputId = taskId
    ? `msplanner-edit-attach-${taskId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
    : 'msplanner-edit-attach';

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
      setReferences([]);
      setInitialReferenceKeys([]);
      setAttachmentUploadsInFlight(0);
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
        const refEntries = detailsData?.references
          ? Object.entries(detailsData.references)
          : [];
        setInitialReferenceKeys(refEntries.map(([k]) => k));
        setReferences(
          refEntries.map(([graphKey, ref]: [string, any]) => ({
            rowId: `ref_${graphKey}`,
            url: plannerReferenceKeyToDisplayUrl(graphKey),
            alias: (ref?.alias as string) || '',
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

  const addReferenceRow = () => {
    setReferences((prev) => [
      ...prev,
      {
        rowId: `ref_new_${Date.now()}`,
        url: '',
        alias: '',
      },
    ]);
  };

  const updateReferenceRow = (
    index: number,
    field: 'url' | 'alias',
    value: string,
  ) => {
    setReferences((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const removeReferenceRow = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  /** Upload each file as soon as the user finishes picking (input change). */
  const runUploadForSelectedFiles = useCallback(
    async (files: File[]) => {
      const fromProp =
        typeof planIdProp === 'string' && planIdProp.trim() ? planIdProp.trim() : '';
      const fromTask =
        typeof task?.planId === 'string' && String(task.planId).trim()
          ? String(task.planId).trim()
          : '';
      const uploadPlanId = fromProp || fromTask;
      if (!uploadPlanId) {
        setError(
          'Cannot upload files: plan id is missing. Open this task from a plan page and try again.',
        );
        return;
      }
      for (const file of files) {
        setAttachmentUploadsInFlight((n) => n + 1);
        try {
          const uploaded = await MsPlannerService.uploadPlannerTaskFile(uploadPlanId, file);
          const webUrl = uploaded?.webUrl;
          if (!webUrl || typeof webUrl !== 'string') {
            throw new Error(`No file URL returned for "${file.name}".`);
          }
          const label = String(uploaded?.name || file.name).slice(0, 255);
          setReferences((prev) => [
            ...prev,
            {
              rowId: `ref_upload_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              url: webUrl,
              alias: label,
            },
          ]);
          setError(null);
        } catch (err: any) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              `Upload failed for "${file.name}".`,
          );
        } finally {
          setAttachmentUploadsInFlight((n) => Math.max(0, n - 1));
        }
      }
    },
    [planIdProp, task?.planId],
  );

  const onAttachmentFilesSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const picked = input.files?.length ? Array.from(input.files) : [];
      input.value = '';
      if (picked.length === 0) return;
      void runUploadForSelectedFiles(picked);
    },
    [runUploadForSelectedFiles],
  );

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
        startDateTime: toGraphDateTimeOrNull(startDateTime),
        dueDateTime: toGraphDateTimeOrNull(dueDateTime),
        appliedCategories,
        assignments,
      });

      if (details != null) {
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

        const referencesPayload: Record<string, any> = {};
        const finalKeys = new Set<string>();

        references.forEach((row) => {
          const u = row.url.trim();
          if (!u) return;
          try {
            const gk = plannerReferenceKeyFromUrl(normalizeReferenceUrl(u));
            finalKeys.add(gk);
            const alias =
              row.alias.trim() ||
              (() => {
                try {
                  return new URL(normalizeReferenceUrl(u)).hostname || u;
                } catch {
                  return u;
                }
              })();
            referencesPayload[gk] = {
              '@odata.type': 'microsoft.graph.plannerExternalReference',
              alias: alias.slice(0, 255),
              type: 'Other',
            };
          } catch {
            /* skip invalid url */
          }
        });
        initialReferenceKeys.forEach((k) => {
          if (!finalKeys.has(k)) {
            referencesPayload[k] = null;
          }
        });

        const detailsBody: {
          detailsEtag: string;
          description: string;
          checklist: Record<string, any>;
          references?: Record<string, any>;
        } = {
          detailsEtag: detailsEtag || '',
          description: note,
          checklist: checklistPayload,
        };
        if (
          Object.keys(referencesPayload).length > 0 ||
          initialReferenceKeys.length > 0
        ) {
          detailsBody.references = referencesPayload;
        }

        await MsPlannerService.updateTaskDetails(taskId, detailsBody);
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

                <div className="form-group">
                  <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                    <label className="mb-0">Attachments / links</label>
                    <div className="d-flex flex-wrap gap-1 position-relative align-items-center">
                      <input
                        id={attachmentInputId}
                        type="file"
                        multiple
                        disabled={attachmentUploadsInFlight > 0}
                        onChange={onAttachmentFilesSelected}
                        aria-label="Choose files to upload"
                        style={{
                          position: 'absolute',
                          width: 1,
                          height: 1,
                          padding: 0,
                          margin: -1,
                          overflow: 'hidden',
                          clip: 'rect(0, 0, 0, 0)',
                          whiteSpace: 'nowrap',
                          border: 0,
                        }}
                      />
                      <label
                        htmlFor={attachmentInputId}
                        className={`btn btn-sm btn-outline-primary mb-0 ${
                          attachmentUploadsInFlight > 0 ? 'disabled' : ''
                        }`}
                        style={{
                          cursor:
                            attachmentUploadsInFlight > 0
                              ? 'not-allowed'
                              : 'pointer',
                        }}
                      >
                        {attachmentUploadsInFlight > 0
                          ? 'Uploading…'
                          : 'Add files'}
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={addReferenceRow}
                      >
                        Add link
                      </button>
                    </div>
                  </div>
                  <p className="text-muted small mb-2">
                    Files upload immediately to the plan&apos;s SharePoint library (up to 25 MB each). Click <strong>Save</strong> to attach them to this task in Planner. You can also add a URL reference below.
                  </p>
                  {references.length === 0 && (
                    <p className="text-muted small">No attachments or links.</p>
                  )}
                  {references.map((row, index) => (
                    <div key={row.rowId} className="mb-2 border rounded p-2 bg-light">
                      <div className="form-group mb-2">
                        <label className="small mb-0">URL</label>
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          value={row.url}
                          onChange={(e) =>
                            updateReferenceRow(index, 'url', e.target.value)
                          }
                          placeholder="https://…"
                        />
                      </div>
                      <div className="form-group mb-2">
                        <label className="small mb-0">Display name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.alias}
                          onChange={(e) =>
                            updateReferenceRow(index, 'alias', e.target.value)
                          }
                          placeholder="Optional label"
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeReferenceRow(index)}
                      >
                        Remove
                      </button>
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
              disabled={saving || !task || attachmentUploadsInFlight > 0}
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

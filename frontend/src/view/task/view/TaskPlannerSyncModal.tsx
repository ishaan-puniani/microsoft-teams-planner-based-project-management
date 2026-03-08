import { Modal } from 'bootstrap';
import { useCallback, useEffect, useRef, useState } from 'react';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import { i18n } from 'src/i18n';

export const PLANNER_SYNC_FIELDS = [
  { id: 'title', labelKey: 'entities.task.fields.title' },
  { id: 'description', labelKey: 'entities.task.fields.description' },
  { id: 'estimatedStart', labelKey: 'entities.task.fields.estimatedStart' },
  { id: 'estimatedEnd', labelKey: 'entities.task.fields.estimatedEnd' },
] as const;

export type PlannerSyncFieldId = (typeof PLANNER_SYNC_FIELDS)[number]['id'];

interface TaskPlannerSyncModalProps {
  show: boolean;
  onClose: () => void;
  mode: 'sync' | 'send';
  taskRecord: {
    msPlannerTaskId?: string | null;
    project?: { id?: string; msGroup?: string; msPlan?: string } | null;
  } | null;
  onConfirm: (options: {
    fields: PlannerSyncFieldId[];
    planId?: string;
    bucketId?: string;
  }) => void;
  loading?: boolean;
}

export default function TaskPlannerSyncModal({
  show,
  onClose,
  mode,
  taskRecord,
  onConfirm,
  loading = false,
}: TaskPlannerSyncModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalInstanceRef = useRef<InstanceType<typeof Modal> | null>(null);
  const appliedPlanDefaultRef = useRef(false);

  const [selectedFields, setSelectedFields] = useState<PlannerSyncFieldId[]>(
    PLANNER_SYNC_FIELDS.map((f) => f.id),
  );
  const [groupId, setGroupId] = useState('');
  const [groupOptions, setGroupOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [planId, setPlanId] = useState('');
  const [planOptions, setPlanOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [bucketId, setBucketId] = useState('');
  const [bucketOptions, setBucketOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingBuckets, setLoadingBuckets] = useState(false);
  const needsPlanAndBucket = mode === 'send' && !taskRecord?.msPlannerTaskId;

  const loadGroups = useCallback(async () => {
    try {
      const list = await MsPlannerService.listGroupsAutocomplete('', 50);
      const options = Array.isArray(list) ? list : (list as any)?.rows ?? [];
      setGroupOptions(options.map((g: any) => ({ id: g.id, name: g.label || g.displayName || g.id })));
    } catch (e) {
      setGroupOptions([]);
    }
  }, []);

  useEffect(() => {
    if (show && needsPlanAndBucket) {
      loadGroups();
    }
  }, [show, needsPlanAndBucket, loadGroups]);

  const loadPlans = useCallback(async (gId: string) => {
    if (!gId) {
      setPlanOptions([]);
      return;
    }
    setLoadingPlans(true);
    try {
      const list = await MsPlannerService.listPlansAutocomplete('', 50, gId);
      const options = Array.isArray(list) ? list : (list as any)?.rows ?? [];
      setPlanOptions(options.map((p: any) => ({ id: p.id, name: p.name || p.label || p.id })));
    } catch (e) {
      setPlanOptions([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    if (!groupId) {
      setPlanId('');
      setBucketId('');
      setPlanOptions([]);
      return;
    }
    setPlanId('');
    setBucketId('');
    loadPlans(groupId);
  }, [groupId, loadPlans]);

  useEffect(() => {
    if (!planId) {
      setBucketId('');
      setBucketOptions([]);
      return;
    }
    let cancelled = false;
    setLoadingBuckets(true);
    MsPlannerService.getBuckets(planId)
      .then((buckets: any[]) => {
        if (!cancelled) {
          const list = Array.isArray(buckets) ? buckets : [];
          setBucketOptions(list.map((b: any) => ({ id: b.id, name: b.name || b.id })));
          setBucketId('');
        }
      })
      .catch(() => {
        if (!cancelled) setBucketOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBuckets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [planId]);

  const defaultGroupId =
    taskRecord?.project?.msGroup != null
      ? (typeof taskRecord.project.msGroup === 'object' && taskRecord.project.msGroup !== null && 'id' in taskRecord.project.msGroup
          ? (taskRecord.project.msGroup as { id: string }).id
          : String(taskRecord.project.msGroup)
        ).trim()
      : '';
  const defaultPlanId =
    taskRecord?.project?.msPlan != null
      ? (typeof taskRecord.project.msPlan === 'object' && taskRecord.project.msPlan !== null && 'id' in taskRecord.project.msPlan
          ? (taskRecord.project.msPlan as { id: string }).id
          : String(taskRecord.project.msPlan)
        ).trim()
      : '';

  useEffect(() => {
    if (show) {
      appliedPlanDefaultRef.current = false;
      setSelectedFields(PLANNER_SYNC_FIELDS.map((f) => f.id));
      setGroupId(needsPlanAndBucket && defaultGroupId ? defaultGroupId : '');
      setPlanId('');
      setBucketId('');
    }
  }, [show, needsPlanAndBucket, defaultGroupId]);

  useEffect(() => {
    if (
      show &&
      needsPlanAndBucket &&
      defaultPlanId &&
      groupId === defaultGroupId &&
      planOptions.some((p) => p.id === defaultPlanId) &&
      !appliedPlanDefaultRef.current
    ) {
      appliedPlanDefaultRef.current = true;
      setPlanId(defaultPlanId);
    }
  }, [show, needsPlanAndBucket, defaultPlanId, groupId, defaultGroupId, planOptions]);

  useEffect(() => {
    if (!show || !modalRef.current) return;
    const el = modalRef.current;
    const modal = new Modal(el, { backdrop: true });
    modalInstanceRef.current = modal;
    modal.show();

    const onHidden = () => {
      modalInstanceRef.current = null;
      onClose();
    };
    el.addEventListener('hidden.bs.modal', onHidden);
    return () => {
      el.removeEventListener('hidden.bs.modal', onHidden);
      modal.hide();
    };
  }, [show, onClose]);

  const closeModal = useCallback(() => {
    if (modalInstanceRef.current && modalRef.current) {
      modalInstanceRef.current.hide();
    }
  }, []);

  const toggleField = (id: PlannerSyncFieldId) => {
    setSelectedFields((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const handleConfirm = () => {
    if (needsPlanAndBucket && (!planId || !bucketId)) return;
    if (selectedFields.length === 0) return;
    onConfirm({
      fields: selectedFields,
      ...(needsPlanAndBucket && { planId, bucketId }),
    });
    closeModal();
  };

  const title =
    mode === 'sync'
      ? 'Update from Planner – choose fields'
      : taskRecord?.msPlannerTaskId
        ? 'Send to Planner – choose fields'
        : 'Send to Planner – plan, bucket & fields';

  if (!show) return null;

  return (
    <div ref={modalRef} className="modal" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeModal}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {needsPlanAndBucket && (
              <div className="mb-3">
                <label className="form-label">Group</label>
                <select
                  className="form-select"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                >
                  <option value="">Select group</option>
                  {groupOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <label className="form-label mt-2">Plan</label>
                <select
                  className="form-select"
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  disabled={!groupId || loadingPlans}
                >
                  <option value="">Select plan</option>
                  {planOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <label className="form-label mt-2">Bucket</label>
                <select
                  className="form-select"
                  value={bucketId}
                  onChange={(e) => setBucketId(e.target.value)}
                  disabled={!planId || loadingBuckets}
                >
                  <option value="">Select bucket</option>
                  {bucketOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="form-label">
              Fields to {mode === 'sync' ? 'update' : 'send'}
            </label>
            <div className="d-flex flex-column gap-1">
              {PLANNER_SYNC_FIELDS.map((f) => (
                <label key={f.id} className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(f.id)}
                    onChange={() => toggleField(f.id)}
                  />
                  {i18n(f.labelKey)}
                </label>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={closeModal}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={
                loading ||
                selectedFields.length === 0 ||
                (needsPlanAndBucket && (!planId || !bucketId))
              }
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  {mode === 'sync' ? 'Updating…' : 'Sending…'}
                </>
              ) : mode === 'sync' ? (
                'Update from Planner'
              ) : (
                'Send to Planner'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import Select from 'react-select';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import MsPGroupAutocompleteFormItem from 'src/view/msPlanner/autocomplete/MsPGroupAutocomplete';
import MsPlanAutocompleteFormItem from 'src/view/msPlanner/autocomplete/MsPlanAutocomplete';

interface PlannerTaskLike {
  id?: string;
  title?: string;
  bucketId?: string;
  planId?: string;
}

interface BucketOption {
  id: string;
  name?: string;
}

interface RelationToOneValue {
  id: string;
  label: string;
}

interface MoveDialogFormValues {
  msGroup: RelationToOneValue | null;
  msPlan: RelationToOneValue | null;
}

interface MoveMsPlannerTaskDialogProps {
  task: PlannerTaskLike;
  currentPlanId?: string;
  visible: boolean;
  onClose: () => void;
  onSuccess: (result: {
    sourceTaskId: string;
    destinationTask: any;
    sourceDeleted: boolean;
    detailsCopied: boolean;
    destinationPlanId: string;
    destinationBucketId: string;
  }) => void;
}

const MoveMsPlannerTaskDialog = ({
  task,
  currentPlanId,
  visible,
  onClose,
  onSuccess,
}: MoveMsPlannerTaskDialogProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalInstanceRef = useRef<any>(null);
  const form = useForm<MoveDialogFormValues>({
    mode: 'all',
    defaultValues: {
      msGroup: null,
      msPlan: null,
    },
  });

  const [destinationPlanId, setDestinationPlanId] = useState('');
  const [destinationBucketId, setDestinationBucketId] = useState('');
  const [deleteSourceTask, setDeleteSourceTask] = useState(true);
  const [copyDetails, setCopyDetails] = useState(true);

  const [buckets, setBuckets] = useState<BucketOption[]>([]);
  const [loadingBuckets, setLoadingBuckets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedGroup = form.watch('msGroup');
  const selectedPlan = form.watch('msPlan');

  useEffect(() => {
    if (!visible || !modalRef.current) return;
    const modal = new Modal(modalRef.current);
    modal.show();
    modalInstanceRef.current = modal;
    return () => {
      modalInstanceRef.current?.hide();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const initialPlanId = String(currentPlanId || task.planId || '').trim();
    form.setValue('msGroup', null);
    form.setValue('msPlan', initialPlanId ? { id: initialPlanId, label: initialPlanId } : null);
    setDestinationPlanId(initialPlanId);
    setDestinationBucketId(task.bucketId || '');
    setDeleteSourceTask(true);
    setCopyDetails(true);
    setError(null);
  }, [visible, currentPlanId, task.planId, task.bucketId, form]);

  useEffect(() => {
    const nextPlanId = String(selectedPlan?.id || '').trim();
    setDestinationPlanId(nextPlanId);
  }, [selectedPlan]);

  useEffect(() => {
    const groupId = String(selectedGroup?.id || '').trim();
    if (!groupId) return;
    form.setValue('msPlan', null);
  }, [selectedGroup?.id, form]);

  useEffect(() => {
    if (!visible) return;
    const planId = destinationPlanId.trim();
    if (!planId) {
      setBuckets([]);
      setDestinationBucketId('');
      return;
    }

    let cancelled = false;
    setLoadingBuckets(true);
    MsPlannerService.getBuckets(planId)
      .then((data) => {
        if (cancelled) return;
        const nextBuckets = Array.isArray(data) ? data : [];
        setBuckets(nextBuckets);
        if (!nextBuckets.some((b) => b.id === destinationBucketId)) {
          const fallback = nextBuckets.find((b) => b.id === task.bucketId)?.id || nextBuckets[0]?.id || '';
          setDestinationBucketId(fallback);
        }
      })
      .catch((err: any) => {
        if (cancelled) return;
        setBuckets([]);
        setError(err?.response?.data?.message || err?.message || 'Failed to load destination buckets');
      })
      .finally(() => {
        if (!cancelled) setLoadingBuckets(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, destinationPlanId, destinationBucketId, task.bucketId]);

  const bucketOptions = useMemo(
    () =>
      buckets.map((b) => ({
        value: b.id,
        label: b.name || b.id,
      })),
    [buckets],
  );

  const selectedBucketOption = useMemo(
    () => bucketOptions.find((opt) => opt.value === destinationBucketId) || null,
    [bucketOptions, destinationBucketId],
  );

  const handleClose = () => {
    modalInstanceRef.current?.hide();
    onClose();
  };

  const handleMove = async () => {
    if (!task.id) {
      setError('Task id is missing');
      return;
    }

    const planId = destinationPlanId.trim();
    if (!planId) {
      setError('Destination plan id is required');
      return;
    }

    if (!destinationBucketId) {
      setError('Destination bucket is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await MsPlannerService.moveTask(task.id, {
        destinationPlanId: planId,
        destinationBucketId,
        deleteSourceTask,
        copyDetails,
      });

      onSuccess({
        sourceTaskId: result?.sourceTaskId || task.id,
        destinationTask: result?.destinationTask,
        sourceDeleted: !!result?.sourceDeleted,
        detailsCopied: !!result?.detailsCopied,
        destinationPlanId: planId,
        destinationBucketId,
      });

      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to move task');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  const content = (
    <div ref={modalRef} className="modal" tabIndex={-1}>
      <div className="modal-dialog modal-md modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Move Task</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              onClick={handleClose}
              aria-label="Close"
              disabled={saving}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="mb-2 text-muted small">
              {task.title || 'Untitled task'}
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="form-group">
              <FormProvider {...form}>
                <div className="row">
                  <div className="col-12">
                    <MsPGroupAutocompleteFormItem
                      name="msGroup"
                      label="Destination Group"
                    />
                  </div>
                  {(String(selectedGroup?.id || '').trim().length > 2 || !selectedGroup?.id) && (
                    <div className="col-12">
                      <MsPlanAutocompleteFormItem
                        key={String(selectedGroup?.id || 'all')}
                        name="msPlan"
                        label="Destination Plan"
                        groupId={selectedGroup?.id}
                      />
                    </div>
                  )}
                </div>
              </FormProvider>
            </div>

            <div className="form-group">
              <label className="font-weight-bold mb-1">Destination Bucket</label>
              <Select
                value={selectedBucketOption}
                onChange={(selected) => setDestinationBucketId(selected?.value || '')}
                options={bucketOptions}
                isClearable
                placeholder={loadingBuckets ? 'Loading buckets...' : 'Select bucket...'}
                isDisabled={saving || loadingBuckets || !destinationPlanId.trim()}
              />
            </div>

            <div className="form-group mb-2">
              <div className="custom-control custom-switch">
                <input
                  id="move-task-copy-details"
                  type="checkbox"
                  className="custom-control-input"
                  checked={copyDetails}
                  onChange={(e) => setCopyDetails(e.target.checked)}
                  disabled={saving}
                />
                <label className="custom-control-label" htmlFor="move-task-copy-details">
                  Copy description, checklist and references
                </label>
              </div>
            </div>

            <div className="form-group mb-0">
              <div className="custom-control custom-switch">
                <input
                  id="move-task-delete-source"
                  type="checkbox"
                  className="custom-control-input"
                  checked={deleteSourceTask}
                  onChange={(e) => setDeleteSourceTask(e.target.checked)}
                  disabled={saving}
                />
                <label className="custom-control-label" htmlFor="move-task-delete-source">
                  Delete source task after move
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleMove}
              disabled={saving || !destinationPlanId.trim() || !destinationBucketId}
            >
              {saving ? 'Moving...' : 'Move Task'}
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

export default MoveMsPlannerTaskDialog;

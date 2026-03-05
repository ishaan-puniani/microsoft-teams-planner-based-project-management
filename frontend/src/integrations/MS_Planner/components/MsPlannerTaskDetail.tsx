import { useEffect, useState } from 'react';
import { Modal } from 'bootstrap';
import { useRef } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Urgent',
  5: 'Important',
  9: 'Medium',
  10: 'Low',
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const m = moment(value);
  return m.isValid() ? m.format('YYYY-MM-DD HH:mm') : '—';
}

interface MsPlannerTaskDetailProps {
  taskId: string | null;
  visible: boolean;
  onClose: () => void;
  categories?: Record<string, string>;
}

const MsPlannerTaskDetail = ({
  taskId,
  visible,
  onClose,
  categories = {},
}: MsPlannerTaskDetailProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalInstanceRef = useRef<any>(null);
  const [task, setTask] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const checklist = details?.checklist ? Object.entries(details.checklist) : [];
  const references = details?.references ? Object.entries(details.references) : [];
  const appliedCategoryKeys = task?.appliedCategories
    ? Object.entries(task.appliedCategories)
        .filter(([, v]) => v)
        .map(([k]) => k)
    : [];
  const priorityLabel =
    task?.priority != null && PRIORITY_LABELS[task.priority]
      ? PRIORITY_LABELS[task.priority]
      : null;

  if (!visible) return null;

  const content = (
    <div ref={modalRef} className="modal" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {loading ? 'Loading...' : task?.title ?? 'Task details'}
            </h5>
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
                {details?.description && (
                  <div className="mb-3">
                    <h6 className="text-muted">Description</h6>
                    <div className="border rounded p-2 bg-light small">
                      {details.description}
                    </div>
                  </div>
                )}
                <div className="row mb-2">
                  <div className="col-md-6">
                    <strong>Start:</strong> {formatDate(task.startDateTime)}
                  </div>
                  <div className="col-md-6">
                    <strong>Due:</strong> {formatDate(task.dueDateTime)}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">
                    <strong>Priority:</strong> {priorityLabel ?? task?.priority ?? '—'}
                  </div>
                  <div className="col-md-6">
                    <strong>Progress:</strong> {task.percentComplete ?? 0}%
                  </div>
                </div>
                {appliedCategoryKeys.length > 0 && (
                  <div className="mb-2">
                    <strong>Categories:</strong>{' '}
                    {appliedCategoryKeys
                      .map((k) => categories[k] || k)
                      .join(', ')}
                  </div>
                )}
                {checklist.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-muted">Checklist</h6>
                    <ul className="list-group list-group-flush">
                      {checklist.map(([key, item]: [string, any]) => (
                        <li
                          key={key}
                          className="list-group-item d-flex align-items-center py-1"
                        >
                          <input
                            type="checkbox"
                            checked={!!item?.isChecked}
                            readOnly
                            className="mr-2"
                          />
                          <span
                            style={{
                              textDecoration: item?.isChecked ? 'line-through' : undefined,
                            }}
                          >
                            {item?.title ?? key}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {references.length > 0 && (
                  <div className="mb-2">
                    <h6 className="text-muted">Attachments / References</h6>
                    <ul className="list-unstyled">
                      {references.map(([key, ref]: [string, any]) => {
                        try {
                          const url = /^https?:\/\//i.test(key)
                            ? key
                            : decodeURIComponent(key);
                          const label = ref?.alias || ref?.type || url;
                          return (
                            <li key={key} className="mb-1">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {label}
                              </a>
                            </li>
                          );
                        } catch {
                          return (
                            <li key={key} className="mb-1">
                              <span>{ref?.alias || ref?.type || key}</span>
                            </li>
                          );
                        }
                      })}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleClose}>
              Close
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

export default MsPlannerTaskDetail;

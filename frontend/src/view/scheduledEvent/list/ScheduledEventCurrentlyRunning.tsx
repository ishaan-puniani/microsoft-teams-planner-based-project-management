import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ScheduledEventService from 'src/modules/scheduledEvent/scheduledEventService';

type RunningItem = {
  event: Record<string, any>;
  occurrenceStart: string;
  occurrenceEnd: string | null;
};

const ScheduledEventCurrentlyRunning = () => {
  const [items, setItems] = useState<RunningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ScheduledEventService.fetchCurrentlyRunning()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="mb-3 text-muted small">
        <i className="fas fa-circle-notch fa-spin me-1" />
        Loading currently running events…
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-3">
      <h6 className="text-danger mb-2">
        <i className="fas fa-circle me-1" style={{ fontSize: '0.6rem', verticalAlign: 'middle' }} />
        Currently Running
      </h6>
      <div className="d-flex flex-wrap gap-2">
        {items.map(({ event, occurrenceStart, occurrenceEnd }) => (
          <div
            key={event.id ?? event._id}
            className="card border-danger"
            style={{ minWidth: 220, maxWidth: 320 }}
          >
            <div className="card-body py-2 px-3">
              <div className="fw-semibold">
                <Link to={`/scheduled-event/${event.id ?? event._id}`}>
                  {event.title}
                </Link>
              </div>
              <div className="text-muted small">
                <i className="fas fa-play me-1" />
                {new Date(occurrenceStart).toLocaleString()}
                {occurrenceEnd && (
                  <>
                    {' – '}
                    {new Date(occurrenceEnd).toLocaleString()}
                  </>
                )}
              </div>
              {event.location && (
                <div className="text-muted small">
                  <i className="fas fa-map-marker-alt me-1" />
                  {event.location}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduledEventCurrentlyRunning;

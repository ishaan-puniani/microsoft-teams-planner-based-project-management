import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ScheduledEventService from 'src/modules/scheduledEvent/scheduledEventService';

type UpcomingItem = {
  event: Record<string, any>;
  nextOccurrence: string;
};

type Props = {
  inHours: number;
};

const ScheduledEventUpcoming = ({ inHours }: Props) => {
  const [items, setItems] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ScheduledEventService.fetchUpcoming(inHours)
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
  }, [inHours]);

  if (loading) {
    return (
      <div className="mb-3 text-muted small">
        <i className="fas fa-circle-notch fa-spin me-1" />
        Loading upcoming events…
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-3">
      <h6 className="text-primary mb-2">
        <i className="fas fa-calendar-alt me-1" />
        Upcoming — next {inHours}h
      </h6>
      <div className="d-flex flex-wrap gap-2">
        {items.map(({ event, nextOccurrence }) => (
          <div
            key={event.id ?? event._id}
            className="card border-primary"
            style={{ minWidth: 220, maxWidth: 320 }}
          >
            <div className="card-body py-2 px-3">
              <div className="fw-semibold">
                <Link to={`/scheduled-event/${event.id ?? event._id}`}>
                  {event.title}
                </Link>
              </div>
              <div className="text-muted small">
                <i className="fas fa-clock me-1" />
                {new Date(nextOccurrence).toLocaleString()}
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

export default ScheduledEventUpcoming;

export interface IScheduledEventFilter {
  title?: string;
  startDateRange?: [Date, Date];
  endDateRange?: [Date, Date];
  timezone?: string;
  createdAtRange?: [Date, Date];
}

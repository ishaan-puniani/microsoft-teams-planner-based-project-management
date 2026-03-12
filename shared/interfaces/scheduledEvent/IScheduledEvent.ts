export type RRuleFrequency =
  | 'SECONDLY'
  | 'MINUTELY'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY';

export type RRuleWeekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

/**
 * Structured representation of an RFC 5545 RRULE configuration.
 * Use rruleString on IScheduledEvent for the serialised "FREQ=…;BYDAY=…" form.
 */
export interface IRRule {
  /** Recurrence frequency */
  freq: RRuleFrequency;
  /** Start date/time of the first occurrence */
  dtstart?: Date;
  /** Recurrence ends on or before this date/time */
  until?: Date;
  /** Total number of occurrences (mutually exclusive with `until`) */
  count?: number;
  /** Interval between occurrences (default 1) */
  interval?: number;
  /** BYDAY – weekday specifiers, e.g. ['MO', 'WE', '-1FR'] */
  byday?: string[];
  /** BYMONTHDAY – days of the month */
  bymonthday?: number[];
  /** BYYEARDAY – days of the year */
  byyearday?: number[];
  /** BYWEEKNO – ISO week numbers */
  byweekno?: number[];
  /** BYMONTH – months (1–12) */
  bymonth?: number[];
  /** BYSETPOS – positions within the set */
  bysetpos?: number[];
  /** BYHOUR */
  byhour?: number[];
  /** BYMINUTE */
  byminute?: number[];
  /** BYSECOND */
  bysecond?: number[];
  /** WKST – week start day */
  wkst?: RRuleWeekday;
  /** TZID – IANA timezone identifier, e.g. 'America/New_York' */
  tzid?: string;
}

export interface IScheduledEvent {
  id?: string;
  /** Human-readable title of the event */
  title: string;
  /** Optional long-form description */
  description?: string;
  /** Event start date/time */
  startDate: Date;
  /** Event end date/time */
  endDate?: Date;
  /** Whether the event spans the whole day */
  allDay?: boolean;
  /** Optional location string */
  location?: string;
  /** IANA timezone for display, e.g. 'UTC', 'America/New_York' */
  timezone?: string;
  /** Structured RRULE configuration */
  rrule?: IRRule;
  /**
   * Serialised RRULE string, e.g. "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR".
   * Stored for convenience and indexed for search.
   */
  rruleString?: string;
  /** ISO 8601 date-time strings for dates to exclude from the recurrence */
  exdates?: Date[];
  /** ISO 8601 date-time strings for extra occurrence dates outside the rule */
  rdates?: Date[];
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IScheduledEventCreate {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
  location?: string;
  timezone?: string;
  rrule?: IRRule;
  rruleString?: string;
  exdates?: Date[];
  rdates?: Date[];
  tenant: string;
}

export interface IScheduledEventUpdate {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  allDay?: boolean;
  location?: string;
  timezone?: string;
  rrule?: IRRule;
  rruleString?: string;
  exdates?: Date[];
  rdates?: Date[];
  tenant?: string;
}

export interface IScheduledEventFilter {
  title?: string;
  startDateRange?: [Date, Date];
  endDateRange?: [Date, Date];
  timezone?: string;
  tenant?: string;
  importHash?: string;
}

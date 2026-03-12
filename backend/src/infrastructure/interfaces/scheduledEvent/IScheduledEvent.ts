import { IBase } from '../base/IBase';

export type RRuleFrequency =
  | 'SECONDLY'
  | 'MINUTELY'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY';

export type RRuleWeekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface IRRule {
  freq: RRuleFrequency;
  dtstart?: Date;
  until?: Date;
  count?: number;
  interval?: number;
  byday?: string[];
  bymonthday?: number[];
  byyearday?: number[];
  byweekno?: number[];
  bymonth?: number[];
  bysetpos?: number[];
  byhour?: number[];
  byminute?: number[];
  bysecond?: number[];
  wkst?: RRuleWeekday;
  tzid?: string;
}

export interface IScheduledEvent extends IBase {
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
}

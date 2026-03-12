import {
  IScheduledEvent,
  IScheduledEventCreate,
  IScheduledEventUpdate,
  IScheduledEventFilter,
  IRRule,
  RRuleFrequency,
  RRuleWeekday,
} from '../interfaces/scheduledEvent/IScheduledEvent';

export type ScheduledEventEntity = IScheduledEvent;
export type ScheduledEventCreateData = IScheduledEventCreate;
export type ScheduledEventUpdateData = IScheduledEventUpdate;
export type ScheduledEventFilterData = IScheduledEventFilter;
export type ScheduledEventRRule = IRRule;
export type ScheduledEventFrequency = RRuleFrequency;
export type ScheduledEventWeekday = RRuleWeekday;
